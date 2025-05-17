import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  
  await app.listen(3000);
  console.log(`API Gateway is running on: ${await app.getUrl()}`);
}
bootstrap();
