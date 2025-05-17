import { Module } from '@nestjs/common';
import { AuthServerController } from './auth-server.controller';
import { AuthServerService } from './auth-server.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './models/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';

/**
 * Auth Server 모듈
 * 사용자 인증, 권한 관리, JWT 발급을 담당
 */
@Module({
  imports: [
    // 환경 변수 설정 모듈
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // MongoDB 연결 설정
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/auth'),
    // User 스키마 등록
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    // JWT 모듈 설정
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthServerController, HealthController],
  providers: [AuthServerService],
})
export class AuthServerModule {}
