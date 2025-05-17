import { Module } from '@nestjs/common';
import { EventServerController } from './event-server.controller';
import { EventServerService } from './event-server.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './models/event.schema';
import { Reward, RewardSchema } from './models/reward.schema';
import { RewardRequest, RewardRequestSchema } from './models/reward-request.schema';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';

/**
 * Event Server 모듈
 * 이벤트 관리, 보상 관리, 보상 요청 처리를 담당
 */
@Module({
  imports: [
    // 환경 변수 설정 모듈
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // MongoDB 연결 설정
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/event'),
    // 필요한 스키마 등록
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Reward.name, schema: RewardSchema },
      { name: RewardRequest.name, schema: RewardRequestSchema },
    ]),
  ],
  controllers: [EventServerController, HealthController],
  providers: [EventServerService],
})
export class EventServerModule {}
