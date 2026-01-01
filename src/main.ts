import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('FinnWave API')
    .setDescription('The FinnWave API description')
    .setVersion('1.0')
    .addTag('finnwave')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
