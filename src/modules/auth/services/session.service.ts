import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/postgres/prisma.service';
import { Session, RevocationReason } from '../../../generated/client/client';

export interface CreateSessionDto {
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class SessionService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(data: CreateSessionDto): Promise<Session> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    return this.prisma.session.create({
      data: {
        userId: data.userId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        expiresAt,
      },
    });
  }

  async getActiveSession(sessionId: string): Promise<Session | null> {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.revoked) {
      return null;
    }

    return session;
  }

  async revokeSession(
    sessionId: string,
    reason: RevocationReason = RevocationReason.USER_LOGOUT,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.session.update({
        where: { id: sessionId },
        data: {
          revoked: true,
          revokedAt: new Date(),
          revocationReason: reason,
        },
      });

      await tx.refreshToken.deleteMany({
        where: { sessionId },
      });
    });
  }

  async revokeAllUserSessions(
    userId: string,
    reason: RevocationReason = RevocationReason.PASSWORD_CHANGE,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const sessions = await tx.session.findMany({
        where: {
          userId,
          revoked: false,
        },
        select: { id: true },
      });

      const sessionIds = sessions.map((s) => s.id);

      await tx.session.updateMany({
        where: {
          userId,
          revoked: false,
        },
        data: {
          revoked: true,
          revokedAt: new Date(),
          revocationReason: reason,
        },
      });

      await tx.refreshToken.deleteMany({
        where: {
          sessionId: { in: sessionIds },
        },
      });
    });
  }

  async validateSessionActivity(session: Session): Promise<boolean> {
    const idleTimeout = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
    const lastActivity = session.lastActivityAt.getTime();
    const isIdle = Date.now() - lastActivity > idleTimeout;

    if (isIdle) {
      await this.revokeSession(session.id, RevocationReason.IDLE_TIMEOUT);
      return false;
    }

    return true;
  }

  async pruneExpiredSessions(): Promise<number> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await this.prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: ninetyDaysAgo,
        },
      },
    });

    return result.count;
  }
}
