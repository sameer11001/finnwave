import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { KycService } from './kyc.service';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import { AttachDocumentDto } from './dto/attach-document.dto';
import { ReviewKycDto } from './dto/review-kyc.dto';
import {
  KycSubmissionResponseDto,
  KycStatusResponseDto,
  KycDocumentResponseDto,
  KycListResponseDto,
} from './dto/kyc-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { KycStatus } from '@prisma/client';

@ApiTags('KYC')
@Controller('kyc')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class KycController {
  constructor(private readonly kycService: KycService) {}

  @Post('submit')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Submit KYC information' })
  @ApiResponse({
    status: 201,
    description: 'KYC submitted successfully',
    type: KycSubmissionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid data or age requirement not met' })
  @ApiResponse({ status: 409, description: 'KYC already submitted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async submitKyc(
    @Body() submitKycDto: SubmitKycDto,
    @GetUser('id') userId: string,
    @Req() req: Request,
  ): Promise<KycSubmissionResponseDto> {
    return this.kycService.submitKyc(submitKycDto, userId, req);
  }

  @Post('documents/attach')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Attach document to KYC submission' })
  @ApiResponse({
    status: 201,
    description: 'Document attached successfully',
    type: KycDocumentResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid data or no KYC submission found' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  @ApiResponse({ status: 403, description: 'Media does not belong to user' })
  @ApiResponse({ status: 409, description: 'Document type already attached' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async attachDocument(
    @Body() attachDocumentDto: AttachDocumentDto,
    @GetUser('id') userId: string,
    @Req() req: Request,
  ): Promise<KycDocumentResponseDto> {
    return this.kycService.attachDocument(attachDocumentDto, userId, req);
  }

  @Get('status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get own KYC status' })
  @ApiResponse({
    status: 200,
    description: 'KYC status retrieved successfully',
    type: KycStatusResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyKycStatus(
    @GetUser('id') userId: string,
  ): Promise<KycStatusResponseDto> {
    return this.kycService.getMyKycStatus(userId);
  }

  @Get('my-submission')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get own KYC submission details' })
  @ApiResponse({
    status: 200,
    description: 'KYC submission retrieved successfully',
    type: KycSubmissionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'No KYC submission found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMyKycSubmission(
    @GetUser('id') userId: string,
  ): Promise<KycSubmissionResponseDto> {
    return this.kycService.getMyKycSubmission(userId);
  }

  // Admin endpoints
  @Get('submissions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all KYC submissions (Admin)' })
  @ApiQuery({ name: 'status', required: false, enum: KycStatus })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'KYC submissions retrieved successfully',
    type: KycListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAllSubmissions(
    @Query('status') status?: KycStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<KycListResponseDto> {
    return this.kycService.getAllSubmissions({
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('submissions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get specific KYC submission (Admin)' })
  @ApiParam({ name: 'id', description: 'KYC submission ID' })
  @ApiResponse({
    status: 200,
    description: 'KYC submission retrieved successfully',
    type: KycSubmissionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'KYC submission not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSubmissionById(
    @Param('id') id: string,
    @GetUser('id') reviewerId: string,
    @Req() req: Request,
  ): Promise<KycSubmissionResponseDto> {
    return this.kycService.getSubmissionById(id, reviewerId, req);
  }

  @Post('submissions/:id/review')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve or reject KYC submission (Admin)' })
  @ApiParam({ name: 'id', description: 'KYC submission ID' })
  @ApiResponse({
    status: 200,
    description: 'KYC reviewed successfully',
    type: KycSubmissionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 404, description: 'KYC submission not found' })
  @ApiResponse({ status: 403, description: 'Cannot review own submission' })
  @ApiResponse({ status: 409, description: 'KYC already approved' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async reviewSubmission(
    @Param('id') id: string,
    @Body() reviewKycDto: ReviewKycDto,
    @GetUser('id') reviewerId: string,
    @Req() req: Request,
  ): Promise<KycSubmissionResponseDto> {
    return this.kycService.reviewSubmission(id, reviewKycDto, reviewerId, req);
  }
}
