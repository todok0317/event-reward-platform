import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient } from 'redis';
import { RewardEvent } from './reward-events';
import { v4 as uuidv4 } from 'uuid';

/**
 * 이벤트 버스 서비스
 * Redis Pub/Sub을 이용한 간단한 이벤트 발행/구독 메커니즘을 제공합니다.
 */
@Injectable()
export class EventBusService implements OnModuleInit, OnModuleDestroy {
  // Redis 발행용 클라이언트
  private publisherClient;
  // Redis 구독용 클라이언트
  private subscriberClient;
  // 이벤트 핸들러 맵
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor() {
    // Redis 클라이언트 초기화
    this.publisherClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
    
    this.subscriberClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });
  }

  /**
   * 모듈 초기화 시 Redis 연결 설정
   */
  async onModuleInit() {
    // Redis 클라이언트 연결
    await this.publisherClient.connect();
    await this.subscriberClient.connect();

    // 메시지 수신 시 처리 로직
    this.subscriberClient.on('message', (channel, message) => {
      try {
        const event = JSON.parse(message) as RewardEvent;
        const handlers = this.eventHandlers.get(event.type);
        
        if (handlers) {
          handlers.forEach(handler => handler(event));
        }
      } catch (error) {
        console.error('이벤트 처리 중 오류 발생:', error);
      }
    });
  }

  /**
   * 모듈 종료 시 Redis 연결 정리
   */
  async onModuleDestroy() {
    await this.publisherClient.quit();
    await this.subscriberClient.quit();
  }

  /**
   * 이벤트 발행
   * @param event 발행할 이벤트 객체
   */
  async publish(event: RewardEvent): Promise<void> {
    // 이벤트 ID와 타임스탬프 자동 생성
    const completeEvent = {
      ...event,
      id: event.id || uuidv4(),
      timestamp: event.timestamp || new Date(),
    };

    // Redis 채널에 메시지 발행
    await this.publisherClient.publish(
      event.type,
      JSON.stringify(completeEvent)
    );
    
    console.log(`이벤트 발행: ${event.type}`, completeEvent);
  }

  /**
   * 이벤트 구독
   * @param eventType 구독할 이벤트 타입
   * @param handler 이벤트 처리 핸들러 함수
   */
  async subscribe(eventType: string, handler: Function): Promise<void> {
    // 핸들러 등록
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
      // Redis 채널 구독
      await this.subscriberClient.subscribe(eventType);
    }
    
    this.eventHandlers.get(eventType).push(handler);
    console.log(`이벤트 구독 등록: ${eventType}`);
  }

  /**
   * 이벤트 구독 취소
   * @param eventType 구독 취소할 이벤트 타입
   * @param handler 제거할 핸들러 함수 (옵션)
   */
  async unsubscribe(eventType: string, handler?: Function): Promise<void> {
    if (!handler) {
      // 특정 이벤트 타입의 모든 핸들러 제거
      this.eventHandlers.delete(eventType);
      await this.subscriberClient.unsubscribe(eventType);
    } else if (this.eventHandlers.has(eventType)) {
      // 특정 핸들러만 제거
      const handlers = this.eventHandlers.get(eventType);
      const index = handlers.indexOf(handler);
      
      if (index !== -1) {
        handlers.splice(index, 1);
      }
      
      // 핸들러가 없으면 구독 취소
      if (handlers.length === 0) {
        this.eventHandlers.delete(eventType);
        await this.subscriberClient.unsubscribe(eventType);
      }
    }
  }
}
