import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type EventDocument = Event & Document;

@Schema({ timestamps: true })
export class Event {
  /**
   * 이벤트 제목
   */
  @Prop({ required: true })
  title: string;

  /**
   * 이벤트 설명
   */
  @Prop()
  description: string;

  /**
   * 이벤트 조건 (예: 로그인 3일, 친구 초대 등)
   */
  @Prop({ required: true })
  condition: string;

  /**
   * 이벤트 시작일
   */
  @Prop({ required: true })
  startDate: Date;

  /**
   * 이벤트 종료일
   */
  @Prop({ required: true })
  endDate: Date;

  /**
   * 이벤트 활성화 여부
   * 기본값: true
   */
  @Prop({ default: true })
  isActive: boolean;
}

export const EventSchema = SchemaFactory.createForClass(Event);
