import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

@Schema({ collection: 'audit_logs', timestamps: true })
export class AuditLog {
  @Prop({ required: true, index: true })
  eventType: string; // KYC_SUBMISSION, KYC_APPROVAL, KYC_REJECTION, MEDIA_UPLOAD, MEDIA_ACCESS, MEDIA_DELETE

  @Prop({ required: true, index: true })
  category: string; // KYC, MEDIA, AUTH, TRANSACTION, etc.

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ index: true })
  resourceId?: string; // KYC submission ID, Media ID, etc.

  @Prop({ required: true })
  performedBy: string; // User ID who performed the action

  @Prop({ type: Object })
  metadata: Record<string, any>;

  @Prop({ required: true })
  ipAddress: string;

  @Prop()
  userAgent?: string;

  @Prop({ default: Date.now, immutable: true, index: true })
  timestamp: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Ensure indexes are created
AuditLogSchema.index({ eventType: 1, timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ category: 1, timestamp: -1 });
AuditLogSchema.index({ resourceId: 1, timestamp: -1 });
