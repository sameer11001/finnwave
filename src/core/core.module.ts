import { Module } from '@nestjs/common';
import { AuditService } from './services/audit.service';
import { CustomLoggerService } from './services/logger.service';
import { AuditLog, AuditLogSchema } from 'src/infrastructure/mongodb/schemas/audit-log.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: AuditLog.name, schema: AuditLogSchema }]),
    ],
    providers: [AuditService, CustomLoggerService],
    exports: [AuditService, CustomLoggerService],
})
export class CoreModule {}

