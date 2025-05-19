/**
 * 보상 처리 관련 이벤트 타입 정의
 */

// 이벤트 타입 열거형
export enum RewardEventType {
  REWARD_REQUESTED = 'reward.requested',
  REWARD_PROCESSED = 'reward.processed',
  REWARD_FAILED = 'reward.failed',
}

// 기본 이벤트 인터페이스
export interface BaseEvent {
  id: string;         // 이벤트 고유 ID
  type: RewardEventType; // 이벤트 타입
  timestamp: Date;    // 이벤트 발생 시간
  correlationId: string; // 연관 ID (사가 트랜잭션 추적용)
}

// 보상 요청 이벤트
export interface RewardRequestedEvent extends BaseEvent {
  type: RewardEventType.REWARD_REQUESTED;
  data: {
    userId: string;
    eventId: string;
    requestId: string;
  };
}

// 보상 처리 완료 이벤트
export interface RewardProcessedEvent extends BaseEvent {
  type: RewardEventType.REWARD_PROCESSED;
  data: {
    userId: string;
    eventId: string;
    requestId: string;
    rewardType: string;
    rewardAmount: number;
  };
}

// 보상 처리 실패 이벤트
export interface RewardFailedEvent extends BaseEvent {
  type: RewardEventType.REWARD_FAILED;
  data: {
    userId: string;
    eventId: string;
    requestId: string;
    reason: string;
  };
}

// 모든 이벤트 타입의 유니온 타입
export type RewardEvent = RewardRequestedEvent | RewardProcessedEvent | RewardFailedEvent;
