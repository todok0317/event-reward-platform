import { NestFactory } from '@nestjs/core';
import { EventServerModule } from './event-server.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(EventServerModule);
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3002);
  console.log(`Event Server is running on: ${await app.getUrl()}`);
}
bootstrap();
