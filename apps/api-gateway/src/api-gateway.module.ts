import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from './http/http.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/jwt.strategy';
import { RolesGuard } from './auth/roles.guard';
import { HealthController } from './health/health.controller';

/**
 * API Gateway 모듈
 * 모든 요청의 진입점 역할을 하며 인증, 라우팅을 담당
 */
@Module({
  imports: [
    // 환경 변수 설정 모듈
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // HTTP 요청 처리 모듈
    HttpModule,
    // 인증 처리 모듈
    PassportModule,
    // JWT 인증 모듈
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ApiGatewayController, HealthController],
  providers: [ApiGatewayService, JwtStrategy, RolesGuard],
})
export class ApiGatewayModule {}
