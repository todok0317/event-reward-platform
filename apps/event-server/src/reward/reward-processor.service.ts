import { Injectable, Logger } from '@nestjs/common';
import { EventBusService } from '@app/common/events/event-bus.service';
import { 
  RewardEventType,
  RewardRequestedEvent,
  RewardProcessedEvent,
  RewardFailedEvent 
} from '@app/common/events/reward-events';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RewardRequest, RewardRequestDocument, RequestStatus } from '../models/reward-request.schema';
import { Event, EventDocument } from '../models/event.schema';
import { Reward, RewardDocument } from '../models/reward.schema';

/**
 * 보상 처리 서비스
 * 사가 패턴을 사용하여 보상 요청 처리 및 상태 관리를 담당합니다.
 */
@Injectable()
export class RewardProcessorService {
  private readonly logger = new Logger(RewardProcessorService.name);

  constructor(
    private readonly eventBusService: EventBusService,
    @InjectModel(RewardRequest.name) private rewardRequestModel: Model<RewardRequestDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
  ) {
    // 보상 요청 이벤트 구독
    this.eventBusService.subscribe(
      RewardEventType.REWARD_REQUESTED,
      this.handleRewardRequested.bind(this)
    );

    // 보상 처리 완료 이벤트 구독
    this.eventBusService.subscribe(
      RewardEventType.REWARD_PROCESSED,
      this.handleRewardProcessed.bind(this)
    );

    // 보상 처리 실패 이벤트 구독
    this.eventBusService.subscribe(
      RewardEventType.REWARD_FAILED,
      this.handleRewardFailed.bind(this)
    );
  }

  /**
   * 보상 요청 시작
   * 사가 트랜잭션의 첫 단계로 보상 요청 이벤트를 발행합니다.
   * @param userId 사용자 ID
   * @param eventId 이벤트 ID
   * @param requestId 요청 ID
   */
  async startRewardRequest(userId: string, eventId: string, requestId: string): Promise<void> {
    this.logger.log(`보상 요청 시작: User=${userId}, Event=${eventId}, Request=${requestId}`);

    const event: RewardRequestedEvent = {
      id: requestId,
      type: RewardEventType.REWARD_REQUESTED,
      timestamp: new Date(),
      correlationId: requestId,
      data: {
        userId,
        eventId,
        requestId,
      }
    };

    await this.eventBusService.publish(event);
  }

  /**
   * 보상 요청 이벤트 처리
   * @param event 보상 요청 이벤트
   */
  private async handleRewardRequested(event: RewardRequestedEvent): Promise<void> {
    const { userId, eventId, requestId } = event.data;
    this.logger.log(`보상 요청 이벤트 처리: ${requestId}`);

    try {
      // 1. 이벤트 존재 여부 확인
      const eventDoc = await this.eventModel.findById(eventId).exec();
      if (!eventDoc) {
        throw new Error(`이벤트를 찾을 수 없음: ${eventId}`);
      }

      // 2. 이벤트 활성화 여부 확인
      if (!eventDoc.isActive) {
        throw new Error(`비활성화된 이벤트: ${eventId}`);
      }

      // 3. 이벤트 기간 확인
      const now = new Date();
      if (now < eventDoc.startDate || now > eventDoc.endDate) {
        throw new Error(`이벤트 기간이 아님: ${eventId}`);
      }

      // 4. 중복 요청 확인
      const existingRequest = await this.rewardRequestModel.findOne({
        userId,
        eventId,
        status: { $in: [RequestStatus.APPROVED, RequestStatus.PENDING] }
      }).exec();

      if (existingRequest) {
        throw new Error(`이미 처리 중이거나 승인된 요청이 있음: ${existingRequest._id}`);
      }

      // 5. 보상 정보 조회
      const rewards = await this.rewardModel.find({ eventId }).exec();
      if (rewards.length === 0) {
        throw new Error(`이벤트에 설정된 보상이 없음: ${eventId}`);
      }

      // 6. 보상 지급 처리 (실제로는 외부 시스템과 연동할 수 있음)
      // 여기서는 간단히 첫 번째 보상을 지급하는 것으로 가정
      const reward = rewards[0];
      
      // 7. 보상 처리 성공 이벤트 발행
      const processedEvent: RewardProcessedEvent = {
        id: requestId + '-processed',
        type: RewardEventType.REWARD_PROCESSED,
        timestamp: new Date(),
        correlationId: event.correlationId,
        data: {
          userId,
          eventId,
          requestId,
          rewardType: reward.type,
          rewardAmount: reward.amount,
        }
      };

      await this.eventBusService.publish(processedEvent);
      
    } catch (error) {
      this.logger.error(`보상 처리 실패: ${error.message}`);
      
      // 실패 이벤트 발행
      const failedEvent: RewardFailedEvent = {
        id: requestId + '-failed',
        type: RewardEventType.REWARD_FAILED,
        timestamp: new Date(),
        correlationId: event.correlationId,
        data: {
          userId,
          eventId,
          requestId,
          reason: error.message,
        }
      };

      await this.eventBusService.publish(failedEvent);
    }
  }

  /**
   * 보상 처리 완료 이벤트 처리
   * @param event 보상 처리 완료 이벤트
   */
  private async handleRewardProcessed(event: RewardProcessedEvent): Promise<void> {
    const { userId, eventId, requestId } = event.data;
    this.logger.log(`보상 처리 완료: ${requestId}`);

    try {
      // 보상 요청 상태 업데이트
      const updatedRequest = await this.rewardRequestModel.findByIdAndUpdate(
        requestId,
        { 
          status: RequestStatus.APPROVED,
          reason: `${event.data.rewardType} ${event.data.rewardAmount} 지급 완료`
        },
        { new: true }
      ).exec();

      if (!updatedRequest) {
        this.logger.warn(`업데이트할 보상 요청을 찾을 수 없음: ${requestId}`);
      }
    } catch (error) {
      this.logger.error(`보상 상태 업데이트 실패: ${error.message}`);
    }
  }

  /**
   * 보상 처리 실패 이벤트 처리
   * @param event 보상 처리 실패 이벤트
   */
  private async handleRewardFailed(event: RewardFailedEvent): Promise<void> {
    const { userId, eventId, requestId, reason } = event.data;
    this.logger.log(`보상 처리 실패: ${requestId}, 이유: ${reason}`);

    try {
      // 보상 요청 상태 업데이트
      const updatedRequest = await this.rewardRequestModel.findByIdAndUpdate(
        requestId,
        { 
          status: RequestStatus.REJECTED,
          reason: reason
        },
        { new: true }
      ).exec();

      if (!updatedRequest) {
        this.logger.warn(`업데이트할 보상 요청을 찾을 수 없음: ${requestId}`);
      }
    } catch (error) {
      this.logger.error(`보상 상태 업데이트 실패: ${error.message}`);
    }
  }
}
