import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../../app.module';
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
);