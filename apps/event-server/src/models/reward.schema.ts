import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Event } from './event.schema';

export type RewardDocument = Reward & Document;

/**
 * 보상 유형 열거형
 */
export enum RewardType {
  POINT = 'POINT',   // 포인트 보상
  ITEM = 'ITEM',     // 아이템 보상
  COUPON = 'COUPON', // 쿠폰 보상
}

@Schema({ timestamps: true })
export class Reward {
  /**
   * 보상 이름
   */
  @Prop({ required: true })
  name: string;

  /**
   * 보상 설명
   */
  @Prop({ required: true })
  description: string;

  /**
   * 보상 유형
   * POINT, ITEM, COUPON 중 하나
   */
  @Prop({ type: String, enum: RewardType, required: true })
  type: RewardType;

  /**
   * 보상 수량
   */
  @Prop({ required: true })
  amount: number;

  /**
   * 연결된 이벤트 ID
   */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event', required: true })
  eventId: Event;
}

export const RewardSchema = SchemaFactory.createForClass(Reward);
