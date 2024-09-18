import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { AuditLogInterceptor } from './utils/AuditLogInterceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'auth';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.useGlobalInterceptors(new AuditLogInterceptor());
  app.enableCors();
  const port = process.env.PORT || 3001;
  await app.listen(port);
  Logger.log(
    `🚀 Auth Microservice is running on: http://localhost:${port}/${globalPrefix}`,
  );
}

bootstrap();
