import { NestFactory } from '@nestjs/core';
import { AuthServerModule } from './auth-server.module';
import { ValidationPipe } from '@nestjs/common';

/**
 * Auth Server 애플리케이션을 부트스트랩하는 함수
 */
async function bootstrap() {
  // NestJS 애플리케이션 생성
  const app = await NestFactory.create(AuthServerModule);
  
  // 유효성 검사 파이프 설정
  app.useGlobalPipes(new ValidationPipe());
  
  // CORS 설정
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // 모든 인터페이스에서 접근 가능하도록 설정
  await app.listen(3001, '0.0.0.0');
  console.log(`Auth Server is running on: http://localhost:3001`);
}

// 애플리케이션 시작
bootstrap();
