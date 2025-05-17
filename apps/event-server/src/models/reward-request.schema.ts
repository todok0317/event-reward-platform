import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Event } from './event.schema';

export type RewardRequestDocument = RewardRequest & Document;

/**
 * 보상 요청 상태 열거형
 */
export enum RequestStatus {
  PENDING = 'PENDING',   // 대기 중
  APPROVED = 'APPROVED', // 승인됨
  REJECTED = 'REJECTED', // 거부됨
}

@Schema({ timestamps: true })
export class RewardRequest {
  /**
   * 사용자 ID
   */
  @Prop({ required: true })
  userId: string;

  /**
   * 연결된 이벤트 ID
   */
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Event', required: true })
  eventId: Event;

  /**
   * 요청 상태
   * 기본값: PENDING
   */
  @Prop({ type: String, enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  /**
   * 상태 변경 사유
   * (승인 또는 거부 시 관리자가 남길 수 있는 메시지)
   */
  @Prop()
  reason: string;
}

export const RewardRequestSchema = SchemaFactory.createForClass(RewardRequest);
