import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { EventBusModule } from './events/event-bus.module';

@Module({
  imports: [EventBusModule],
  providers: [CommonService],
  exports: [CommonService, EventBusModule],
})
export class CommonModule {}
