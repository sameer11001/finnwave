import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';
import { AuditLog, AuditLogDocument } from 'src/infrastructure/mongodb/schemas/audit-log.schema';
import { CustomLoggerService, LogContext } from './logger.service';

@Injectable()
export class AuditService {
  private readonly logger: CustomLoggerService;

  constructor(
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
  ) {
    this.logger = new CustomLoggerService();
    this.logger.setContext(LogContext.AUDIT);
  }
  
  async log(
    eventType: string,
    category: string,
    userId: string,
    resourceId: string | null,
    performedBy: string,
    metadata: Record<string, any>,
    req?: Request,
  ): Promise<void> {
    try {
      const ipAddress = req?.ip || req?.socket?.remoteAddress || 'unknown';
      const userAgent = req?.headers['user-agent'];

      this.logger.debug(`Creating audit log: ${eventType}`, {
        eventType,
        category,
        userId,
        resourceId,
        performedBy,
        ipAddress,
      });

      const auditLog = new this.auditLogModel({
        eventType,
        category,
        userId,
        resourceId,
        performedBy,
        metadata,
        ipAddress,
        userAgent,
      });

      await auditLog.save();

      this.logger.log(
        `Audit log created: ${eventType} by ${performedBy} for user ${userId}`,
        { eventType, userId, performedBy },
      );
    } catch (error) {
      // Don't throw - audit logging should not break the main flow
      this.logger.error(
        `Failed to create audit log: ${error.message}`,
        error.stack,
        { eventType, userId, error: error.message },
      );
    }
  }


  async getResourceAuditTrail(
    resourceId: string,
    limit: number = 100,
  ): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({ resourceId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean()
      .exec();
  }


  async getUserAuditTrail(
    userId: string,
    limit: number = 100,
  ): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean()
      .exec();
  }


  async getAuditTrail(filters: {
    eventType?: string;
    category?: string;
    userId?: string;
    resourceId?: string;
    performedBy?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): Promise<AuditLog[]> {
    const query: any = {};

    if (filters.eventType) query.eventType = filters.eventType;
    if (filters.category) query.category = filters.category;
    if (filters.userId) query.userId = filters.userId;
    if (filters.resourceId) query.resourceId = filters.resourceId;
    if (filters.performedBy) query.performedBy = filters.performedBy;

    if (filters.startDate || filters.endDate) {
      query.timestamp = {};
      if (filters.startDate) query.timestamp.$gte = filters.startDate;
      if (filters.endDate) query.timestamp.$lte = filters.endDate;
    }

    return this.auditLogModel
      .find(query)
      .sort({ timestamp: -1 })
      .limit(filters.limit || 100)
      .lean()
      .exec();
  }
}
