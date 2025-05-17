import { Module } from '@nestjs/common';
import { EventServerController } from './event-server.controller';
import { EventServerService } from './event-server.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './models/event.schema';
import { Reward, RewardSchema } from './models/reward.schema';
import { RewardRequest, RewardRequestSchema } from './models/reward-request.schema';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/event'),
    MongooseModule.forFeature([
      { name: Event.name, schema: EventSchema },
      { name: Reward.name, schema: RewardSchema },
      { name: RewardRequest.name, schema: RewardRequestSchema },
    ]),
  ],
  controllers: [EventServerController],
  providers: [EventServerService],
})
export class EventServerModule {}
