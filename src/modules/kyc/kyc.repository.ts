import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/postgres/prisma.service';
import {
  KycSubmission,
  KycDocument,
  KycStatus,
  Prisma,
} from '../../generated/client/client';

@Injectable()
export class KycRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSubmission(
    data: Prisma.KycSubmissionCreateInput,
  ): Promise<KycSubmission> {
    return this.prisma.kycSubmission.create({ data });
  }

  async findByUserId(userId: string): Promise<KycSubmission | null> {
    return this.prisma.kycSubmission.findUnique({
      where: { userId },
      include: {
        documents: {
          include: {
            media: true,
          },
        },
      },
    });
  }

  async findById(id: string): Promise<KycSubmission | null> {
    return this.prisma.kycSubmission.findUnique({
      where: { id },
      include: {
        documents: {
          include: {
            media: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });
  }

  async findAll(filters: {
    status?: KycStatus;
    skip?: number;
    take?: number;
  }): Promise<{ data: KycSubmission[]; total: number }> {
    const where: Prisma.KycSubmissionWhereInput = {
      ...(filters.status && { status: filters.status }),
    };

    const [data, total] = await Promise.all([
      this.prisma.kycSubmission.findMany({
        where,
        skip: filters.skip,
        take: filters.take,
        orderBy: { submittedAt: 'desc' },
        include: {
          documents: {
            include: {
              media: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      }),
      this.prisma.kycSubmission.count({ where }),
    ]);

    return { data, total };
  }

  async updateStatus(
    id: string,
    status: KycStatus,
    reviewedBy: string,
    rejectionReason?: string,
  ): Promise<KycSubmission> {
    return this.prisma.kycSubmission.update({
      where: { id },
      data: {
        status,
        reviewedBy,
        reviewedAt: new Date(),
        rejectionReason,
      },
    });
  }

  async attachDocument(
    data: Prisma.KycDocumentCreateInput,
  ): Promise<KycDocument> {
    return this.prisma.kycDocument.create({ data });
  }

  async findDocumentByType(
    kycSubmissionId: string,
    documentType: string,
  ): Promise<KycDocument | null> {
    return this.prisma.kycDocument.findUnique({
      where: {
        kycSubmissionId_documentType: {
          kycSubmissionId,
          documentType: documentType as any,
        },
      },
    });
  }
}
