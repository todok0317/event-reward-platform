import { NestFactory } from '@nestjs/core';
import { AuthServerModule } from './auth-server.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AuthServerModule);
  app.useGlobalPipes(new ValidationPipe());
  
  await app.listen(3001);
  console.log(`Auth Server is running on: ${await app.getUrl()}`);
}
bootstrap();
