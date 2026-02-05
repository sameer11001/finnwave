import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { PrismaService } from '../../../infrastructure/postgres/prisma.service';
import { RevocationReason } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  sid: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
      expiresIn: '10m', // Short-lived for security
    });
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  async hashRefreshToken(token: string): Promise<string> {
    return argon2.hash(token, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3,
      parallelism: 4,
    });
  }

  async verifyRefreshToken(token: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, token);
    } catch {
      return false;
    }
  }

  async rotateRefreshToken(
    refreshToken: string,
  ): Promise<TokenPair & { userId: string; sessionId: string }> {
    return this.prisma.$transaction(async (tx) => {
      const activeTokens = await tx.refreshToken.findMany({
  where: {
    usedAt: null,
    expiresAt: { gt: new Date() },
  },
  include: {
    session: {
      include: {
        user: {
          include: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    },
  },
});

      let storedToken: (typeof activeTokens)[0] | null = null;
      for (const token of activeTokens) {
        const isValid = await this.verifyRefreshToken(
          refreshToken,
          token.tokenHash,
        );
        if (isValid) {
          storedToken = token;
          break;
        }
      }

      if (!storedToken) {
        await this.handleTokenReuse(refreshToken, tx);
        throw new Error('Invalid or reused refresh token');
      }

      // 4. Validate session
      if (storedToken.session.revoked) {
        throw new Error('Session has been revoked');
      }

      if (storedToken.session.expiresAt < new Date()) {
        throw new Error('Session expired');
      }

      // 5. Check idle timeout (7 days)
      const idleTimeout = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
      const lastActivity = storedToken.session.lastActivityAt.getTime();
      if (Date.now() - lastActivity > idleTimeout) {
        await tx.session.update({
          where: { id: storedToken.sessionId },
          data: {
            revoked: true,
            revokedAt: new Date(),
            revocationReason: RevocationReason.IDLE_TIMEOUT,
          },
        });
        throw new Error('Session idle timeout');
      }

      await tx.refreshToken.update({
        where: { id: storedToken.id },
        data: { usedAt: new Date() },
      });

      const newRefreshToken = this.generateRefreshToken();
      const newTokenHash = await this.hashRefreshToken(newRefreshToken);

      await tx.refreshToken.create({
        data: {
          sessionId: storedToken.sessionId,
          tokenHash: newTokenHash,
          tokenFamily: storedToken.tokenFamily,
          parentTokenId: storedToken.id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      await tx.session.update({
        where: { id: storedToken.sessionId },
        data: { lastActivityAt: new Date() },
      });

      const accessToken = this.generateAccessToken({
        sub: storedToken.session.userId,
        email: storedToken.session.user.email,
        sid: storedToken.sessionId,
        role: storedToken.session.user.role?.name,
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        userId: storedToken.session.userId,
        sessionId: storedToken.sessionId,
      };
    });
  }

  private async handleTokenReuse(refreshToken: string, tx: any): Promise<void> {
    const usedTokens = await tx.refreshToken.findMany({
      where: {
        usedAt: { not: null },
      },
      select: { id: true, sessionId: true, tokenHash: true, usedAt: true },
    });

    for (const usedToken of usedTokens) {
      const isMatch = await this.verifyRefreshToken(
        refreshToken,
        usedToken.tokenHash,
      );

      if (isMatch) {
        await tx.session.update({
          where: { id: usedToken.sessionId },
          data: {
            revoked: true,
            revokedAt: new Date(),
            revocationReason: RevocationReason.TOKEN_REUSE,
          },
        });

        await tx.refreshToken.deleteMany({
          where: { sessionId: usedToken.sessionId },
        });
        break;
      }
    }
  }
}
