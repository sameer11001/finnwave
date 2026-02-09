import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Response, Request } from 'express';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { ListMediaDto } from './dto/list-media.dto';
import {
  MediaResponseDto,
  MediaListResponseDto,
} from './dto/media-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload a media file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file', 'category'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload (PDF, JPG, PNG, WEBP)',
        },
        category: {
          type: 'string',
          enum: [
            'KYC_DOCUMENT',
            'USER_AVATAR',
            'TRANSACTION_RECEIPT',
            'SUPPORT_ATTACHMENT',
            'PROFILE_DOCUMENT',
            'OTHER',
          ],
          description: 'Category of the media file',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    type: MediaResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid file or data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadMediaDto: UploadMediaDto,
    @GetUser('id') userId: string,
    @Req() req: Request,
  ): Promise<MediaResponseDto> {
    return this.mediaService.uploadFile(file, uploadMediaDto, userId, req);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List user media files' })
  @ApiQuery({ name: 'category', required: false, enum: ['KYC_DOCUMENT', 'USER_AVATAR', 'TRANSACTION_RECEIPT', 'SUPPORT_ATTACHMENT', 'PROFILE_DOCUMENT', 'OTHER'] })
  @ApiQuery({ name: 'type', required: false, enum: ['IMAGE', 'PDF', 'VIDEO', 'AUDIO', 'DOCUMENT', 'OTHER'] })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'VERIFIED', 'REJECTED', 'ARCHIVED'] })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Media list retrieved successfully',
    type: MediaListResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async listMedia(
    @Query() listMediaDto: ListMediaDto,
    @GetUser('id') userId: string,
  ): Promise<MediaListResponseDto> {
    return this.mediaService.listUserMedia(userId, listMediaDto);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get media metadata' })
  @ApiParam({ name: 'id', description: 'Media ID' })
  @ApiResponse({
    status: 200,
    description: 'Media metadata retrieved successfully',
    type: MediaResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Media not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMedia(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') role: string,
  ): Promise<MediaResponseDto> {
    const isAdmin = role === 'ADMIN' || role === 'OPERATOR';
    const media = await this.mediaService.getMedia(id, userId, isAdmin);
    return {
      id: media.id,
      category: media.category,
      type: media.type,
      originalFileName: media.originalFileName,
      fileSize: media.fileSize,
      mimeType: media.mimeType,
      uploadedAt: media.uploadedAt,
      verifiedAt: media.verifiedAt ?? undefined,
      verifiedBy: media.verifiedBy ?? undefined,
      rejectionReason: media.rejectionReason ?? undefined,
      metadata: media.metadata as Record<string, any>,
      uploadedBy: media.uploadedBy,
    };
  }

  @Get(':id/download')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Download media file' })
  @ApiParam({ name: 'id', description: 'Media ID' })
  @ApiResponse({
    status: 200,
    description: 'File downloaded successfully',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Media not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async downloadMedia(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') role: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const isAdmin = role === 'ADMIN' || role === 'OPERATOR';
    const { buffer, media } = await this.mediaService.downloadMedia(
      id,
      userId,
      isAdmin,
      req,
    );

    res.setHeader('Content-Type', media.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${media.originalFileName}"`,
    );
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete (archive) media file' })
  @ApiParam({ name: 'id', description: 'Media ID' })
  @ApiResponse({ status: 204, description: 'Media deleted successfully' })
  @ApiResponse({ status: 404, description: 'Media not found' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteMedia(
    @Param('id') id: string,
    @GetUser('id') userId: string,
    @GetUser('role') role: string,
    @Req() req: Request,
  ): Promise<void> {
    const isAdmin = role === 'ADMIN' || role === 'OPERATOR';
    await this.mediaService.deleteMedia(id, userId, isAdmin, req);
  }
  
}
