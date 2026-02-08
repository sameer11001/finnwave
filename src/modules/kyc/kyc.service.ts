import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KycRepository } from './kyc.repository';
import { MediaRepository } from '../media/media.repository';
import { AuditService } from '../../core/services/audit.service';
import { CustomLoggerService, LogContext } from '../../core/services/logger.service';
import { PrismaService } from '../../infrastructure/postgres/prisma.service';
import {
  KycStatus,
  KycSubmission,
  KycDocument,
  Media,
  MediaCategory,
} from '@prisma/client';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import { AttachDocumentDto } from './dto/attach-document.dto';
import { ReviewKycDto, ReviewAction } from './dto/review-kyc.dto';
import {
  KycSubmissionResponseDto,
  KycStatusResponseDto,
  KycDocumentResponseDto,
  KycListResponseDto,
} from './dto/kyc-response.dto';
import { Request } from 'express';

// Type for KycSubmission with documents relation
type KycSubmissionWithDocuments = KycSubmission & {
  documents?: (KycDocument & { media?: Media })[];
};

@Injectable()
export class KycService {
  private readonly logger: CustomLoggerService;
  private readonly minAge: number;

  constructor(
    private readonly kycRepository: KycRepository,
    private readonly mediaRepository: MediaRepository,
    private readonly auditService: AuditService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.logger = new CustomLoggerService();
    this.logger.setContext(LogContext.KYC);
    this.minAge = this.configService.get<number>('KYC_MIN_AGE') || 18;
  }

  async submitKyc(
    submitKycDto: SubmitKycDto,
    userId: string,
    req: Request,
  ): Promise<KycSubmissionResponseDto> {
    // Check if user already has a submission
    const existing = await this.kycRepository.findByUserId(userId);

    if (existing) {
      // If approved, cannot resubmit
      if (existing.status === KycStatus.APPROVED) {
        throw new ConflictException(
          'KYC already approved. Cannot submit again.',
        );
      }

      // If pending, cannot resubmit
      if (existing.status === KycStatus.PENDING) {
        throw new ConflictException(
          'KYC submission already pending review. Cannot submit again.',
        );
      }

      // If rejected, user can resubmit (will update existing)
    }

    // Validate age
    const dateOfBirth = new Date(submitKycDto.dateOfBirth);
    const age = this.calculateAge(dateOfBirth);

    if (age < this.minAge) {
      throw new BadRequestException(
        `You must be at least ${this.minAge} years old to submit KYC`,
      );
    }

    this.logger.debug(`Submitting KYC for user ${userId}`, {
      userId,
      nationality: submitKycDto.nationality,
      country: submitKycDto.country,
    });

    try {
      // Create or update KYC submission
      const submission = await this.kycRepository.createSubmission({
        user: { connect: { id: userId } },
        firstName: submitKycDto.firstName,
        middleName: submitKycDto.middleName,
        lastName: submitKycDto.lastName,
        dateOfBirth,
        nationality: submitKycDto.nationality,
        addressLine1: submitKycDto.addressLine1,
        addressLine2: submitKycDto.addressLine2,
        city: submitKycDto.city,
        state: submitKycDto.state,
        postalCode: submitKycDto.postalCode,
        country: submitKycDto.country,
        ipAddress: req.ip || req.socket?.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      // Audit log
      await this.auditService.log(
        'KYC_SUBMISSION',
        'KYC',
        userId,
        submission.id,
        userId,
        {
          firstName: submitKycDto.firstName,
          lastName: submitKycDto.lastName,
          nationality: submitKycDto.nationality,
          country: submitKycDto.country,
        },
        req,
      );

      this.logger.log(`KYC submitted: ${submission.id} by user ${userId}`, {
        submissionId: submission.id,
        userId,
      });

      return this.toResponseDto(submission);
    } catch (error) {
      this.logger.error(
        `Failed to submit KYC: ${error.message}`,
        error.stack,
        { userId, error: error.message },
      );
      throw new BadRequestException(`KYC submission failed: ${error.message}`);
    }
  }

  async attachDocument(
    attachDocumentDto: AttachDocumentDto,
    userId: string,
    req: Request,
  ): Promise<KycDocumentResponseDto> {
    // Get user's KYC submission
    const submission = await this.kycRepository.findByUserId(userId);

    if (!submission) {
      throw new BadRequestException(
        'You must submit KYC information before attaching documents',
      );
    }

    // Cannot attach documents to approved KYC
    if (submission.status === KycStatus.APPROVED) {
      throw new ConflictException(
        'KYC already approved. Cannot attach more documents.',
      );
    }

    // Verify media belongs to user and is KYC category
    const media = await this.mediaRepository.findById(
      attachDocumentDto.mediaId,
    );

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    if (media.uploadedBy !== userId) {
      throw new ForbiddenException('Media does not belong to you');
    }

    if (media.category !== MediaCategory.KYC_DOCUMENT) {
      throw new BadRequestException(
        'Media must be in KYC_DOCUMENT category',
      );
    }

    // Check if document type already exists
    const existingDoc = await this.kycRepository.findDocumentByType(
      submission.id,
      attachDocumentDto.documentType,
    );

    if (existingDoc) {
      throw new ConflictException(
        `Document of type ${attachDocumentDto.documentType} already attached`,
      );
    }

    try {
      // Attach document
      const document = await this.kycRepository.attachDocument({
        kycSubmission: { connect: { id: submission.id } },
        media: { connect: { id: attachDocumentDto.mediaId } },
        documentType: attachDocumentDto.documentType,
        documentNumber: attachDocumentDto.documentNumber,
        expiryDate: attachDocumentDto.expiryDate
          ? new Date(attachDocumentDto.expiryDate)
          : undefined,
        issuingCountry: attachDocumentDto.issuingCountry,
      });

      // Audit log
      await this.auditService.log(
        'KYC_DOCUMENT_ATTACH',
        'KYC',
        userId,
        submission.id,
        userId,
        {
          documentType: attachDocumentDto.documentType,
          mediaId: attachDocumentDto.mediaId,
        },
        req,
      );

      this.logger.log(
        `Document attached: ${document.id} to KYC ${submission.id}`,
        {
          documentId: document.id,
          submissionId: submission.id,
          documentType: document.documentType,
        },
      );

      return {
        id: document.id,
        documentType: document.documentType,
        mediaId: document.mediaId,
        documentNumber: document.documentNumber ?? undefined,
        expiryDate: document.expiryDate ?? undefined,
        issuingCountry: document.issuingCountry ?? undefined,
        createdAt: document.createdAt,
        fileName: media.originalFileName,
        fileSize: media.fileSize
      };
    } catch (error) {
      this.logger.error(
        `Failed to attach document: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Document attachment failed: ${error.message}`,
      );
    }
  }

  async getMyKycStatus(userId: string): Promise<KycStatusResponseDto> {
    const submission = await this.kycRepository.findByUserId(userId) as KycSubmissionWithDocuments;

    if (!submission) {
      return {
        status: KycStatus.PENDING,
        hasSubmission: false,
        documentsCount: 0,
      };
    }

    return {
      status: submission.status,
      hasSubmission: true,
      submittedAt: submission.submittedAt,
      reviewedAt: submission.reviewedAt ?? undefined,
      rejectionReason: submission.rejectionReason ?? undefined,
      documentsCount: submission.documents?.length || 0,
    };
  }

  async getMyKycSubmission(userId: string): Promise<KycSubmissionResponseDto> {
    const submission = await this.kycRepository.findByUserId(userId);

    if (!submission) {
      throw new NotFoundException('No KYC submission found');
    }

    return this.toResponseDto(submission);
  }

  async getAllSubmissions(filters: {
    status?: KycStatus;
    page?: number;
    limit?: number;
  }): Promise<KycListResponseDto> {
    const skip = ((filters.page || 1) - 1) * (filters.limit || 10);

    const { data, total } = await this.kycRepository.findAll({
      status: filters.status,
      skip,
      take: filters.limit,
    });

    return {
      data: data.map((submission) => this.toResponseDto(submission)),
      total,
      page: filters.page || 1,
      limit: filters.limit || 10,
    };
  }

  async getSubmissionById(
    id: string,
    reviewerId: string,
    req: Request,
  ): Promise<KycSubmissionResponseDto> {
    const submission = await this.kycRepository.findById(id);

    if (!submission) {
      throw new NotFoundException('KYC submission not found');
    }

    // Audit log for access
    await this.auditService.log(
      'KYC_SUBMISSION_ACCESS',
      'KYC',
      submission.userId,
      submission.id,
      reviewerId,
      {},
      req,
    );

    return this.toResponseDto(submission);
  }

  async reviewSubmission(
    id: string,
    reviewKycDto: ReviewKycDto,
    reviewerId: string,
    req: Request,
  ): Promise<KycSubmissionResponseDto> {
    const submission = await this.kycRepository.findById(id) as KycSubmissionWithDocuments;

    if (!submission) {
      throw new NotFoundException('KYC submission not found');
    }

    // Cannot review own submission
    if (submission.userId === reviewerId) {
      throw new ForbiddenException('You cannot review your own KYC submission');
    }

    // Cannot review already approved submission
    if (submission.status === KycStatus.APPROVED) {
      throw new ConflictException('KYC already approved');
    }

    const newStatus =
      reviewKycDto.action === ReviewAction.APPROVE
        ? KycStatus.APPROVED
        : KycStatus.REJECTED;

    try {
      // Update submission status
      const updated = await this.kycRepository.updateStatus(
        id,
        newStatus,
        reviewerId,
        reviewKycDto.rejectionReason,
      );

      // Update user's KYC status
      await this.prisma.user.update({
        where: { id: submission.userId },
        data: {
          kycStatus: newStatus,
          kycVerifiedAt:
            newStatus === KycStatus.APPROVED ? new Date() : null,
        },
      });

      // Update all attached media status
      if (submission.documents && submission.documents.length > 0) {
        const mediaIds = submission.documents.map((doc) => doc.mediaId);
        await this.prisma.media.updateMany({
          where: { id: { in: mediaIds } },
          data: {
            verifiedBy: reviewerId,
            verifiedAt: new Date(),
          },
        });
      }

      // Audit log
      await this.auditService.log(
        newStatus === KycStatus.APPROVED
          ? 'KYC_APPROVAL'
          : 'KYC_REJECTION',
        'KYC',
        submission.userId,
        submission.id,
        reviewerId,
        {
          action: reviewKycDto.action,
          rejectionReason: reviewKycDto.rejectionReason,
        },
        req,
      );

      this.logger.log(
        `KYC ${reviewKycDto.action.toLowerCase()}ed: ${id} by reviewer ${reviewerId}`,
        {
          submissionId: id,
          reviewerId,
          action: reviewKycDto.action,
          newStatus,
        },
      );

      // Fetch updated submission
      const final = await this.kycRepository.findById(id);
      return this.toResponseDto(final!);
    } catch (error) {
      this.logger.error(`Failed to review KYC: ${error.message}`, error.stack);
      throw new BadRequestException(`KYC review failed: ${error.message}`);
    }
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    let age = today.getFullYear() - dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - dateOfBirth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
    ) {
      age--;
    }

    return age;
  }

  private toResponseDto(submission: KycSubmissionWithDocuments): KycSubmissionResponseDto {
    return {
      id: submission.id,
      userId: submission.userId,
      firstName: submission.firstName,
      middleName: submission.middleName ?? undefined,
      lastName: submission.lastName,
      dateOfBirth: submission.dateOfBirth,
      nationality: submission.nationality,
      addressLine1: submission.addressLine1,
      addressLine2: submission.addressLine2 ?? undefined,
      city: submission.city,
      state: submission.state ?? undefined,
      postalCode: submission.postalCode,
      country: submission.country,
      status: submission.status,
      submittedAt: submission.submittedAt,
      reviewedAt: submission.reviewedAt ?? undefined,
      reviewedBy: submission.reviewedBy ?? undefined,
      rejectionReason: submission.rejectionReason ?? undefined,
      documents: submission.documents?.map((doc) => ({
        id: doc.id,
        documentType: doc.documentType,
        mediaId: doc.mediaId,
        documentNumber: doc.documentNumber ?? undefined,
        expiryDate: doc.expiryDate ?? undefined,
        issuingCountry: doc.issuingCountry ?? undefined,
        createdAt: doc.createdAt,
        fileName: doc.media?.originalFileName || '',
        fileSize: doc.media?.fileSize || 0
      })) || [],
    };
  }
}
