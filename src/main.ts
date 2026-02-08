import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './core/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import { LoggingInterceptor } from './core/interceptors/logging.interceptor';
import { CustomLoggerService } from './core/services/logger.service';


async function bootstrap() {
  // Create custom logger
  const customLogger = new CustomLoggerService();
  customLogger.setContext('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: customLogger,
  });

  customLogger.log('Starting FinnWave application...');

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('FinnWave API')
    .setDescription('The FinnWave API description')
    .setVersion('1.0')
    .addTag('finnwave')
    .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
    },
    'access-token', // name
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, documentFactory);
  customLogger.log('Swagger documentation available at /api/docs');
  

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  // Add logging interceptor before transform interceptor
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  customLogger.log(`Application is running on: http://localhost:${port}`);
  customLogger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  customLogger.log(`Log Level: ${process.env.LOG_LEVEL || 'auto'}`);
  customLogger.log(`Debug Mode: ${customLogger.isDebugEnabled() ? 'ENABLED' : 'DISABLED'}`);
}
bootstrap();

