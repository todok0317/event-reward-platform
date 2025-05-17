import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Event, EventDocument } from './models/event.schema';
import { Reward, RewardDocument } from './models/reward.schema';
import { RewardRequest, RewardRequestDocument, RequestStatus } from './models/reward-request.schema';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { CreateRewardDto, RewardRequestDto } from './dto/reward.dto';

@Injectable()
export class EventServerService {
  constructor(
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    @InjectModel(Reward.name) private rewardModel: Model<RewardDocument>,
    @InjectModel(RewardRequest.name) private rewardRequestModel: Model<RewardRequestDocument>,
  ) {}

  // 이벤트 관련 메서드
  /**
   * 이벤트 생성
   * @param createEventDto 이벤트 생성 DTO
   * @returns 생성된 이벤트 정보
   */
  async createEvent(createEventDto: CreateEventDto): Promise<Event> {
    const newEvent = new this.eventModel(createEventDto);
    return newEvent.save();
  }

  /**
   * 모든 이벤트 조회
   * @returns 이벤트 목록
   */
  async findAllEvents(): Promise<Event[]> {
    return this.eventModel.find().exec();
  }

  /**
   * ID로 이벤트 조회
   * @param id 이벤트 ID
   * @returns 이벤트 정보
   */
  async findEventById(id: string): Promise<Event> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException('이벤트를 찾을 수 없습니다');
    }
    return event;
  }

  /**
   * 이벤트 업데이트
   * @param id 이벤트 ID
   * @param updateEventDto 이벤트 업데이트 DTO
   * @returns 업데이트된 이벤트 정보
   */
  async updateEvent(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .exec();
    
    if (!updatedEvent) {
      throw new NotFoundException('이벤트를 찾을 수 없습니다');
    }
    
    return updatedEvent;
  }

  // 보상 관련 메서드
  /**
   * 보상 생성
   * @param eventId 이벤트 ID
   * @param createRewardDto 보상 생성 DTO
   * @returns 생성된 보상 정보
   */
  async createReward(eventId: string, createRewardDto: CreateRewardDto): Promise<Reward> {
    // 이벤트 존재 여부 확인
    const event = await this.eventModel.findById(eventId).exec();
    if (!event) {
      throw new NotFoundException('이벤트를 찾을 수 없습니다');
    }
    
    const newReward = new this.rewardModel({
      ...createRewardDto,
      eventId,
    });
    
    return newReward.save();
  }

  /**
   * 이벤트별 보상 목록 조회
   * @param eventId 이벤트 ID
   * @returns 보상 목록
   */
  async findRewardsByEventId(eventId: string): Promise<Reward[]> {
    return this.rewardModel.find({ eventId }).exec();
  }

  // 보상 요청 관련 메서드
  /**
   * 보상 요청
   * @param eventId 이벤트 ID
   * @param rewardRequestDto 보상 요청 DTO
   * @returns 생성된 보상 요청 정보
   */
  async requestReward(eventId: string, rewardRequestDto: RewardRequestDto): Promise<RewardRequest> {
    const { userId } = rewardRequestDto;
    
    // 이벤트 존재 여부 확인
    const event = await this.eventModel.findById(eventId).exec();
    if (!event) {
      throw new NotFoundException('이벤트를 찾을 수 없습니다');
    }
    
    // 이벤트 활성화 여부 확인
    if (!event.isActive) {
      throw new BadRequestException('이벤트가 활성화되지 않았습니다');
    }
    
    // 이벤트 기간 유효성 확인
    const currentDate = new Date();
    if (currentDate < event.startDate || currentDate > event.endDate) {
      throw new BadRequestException('이벤트 기간이 아닙니다');
    }
    
    // 중복 보상 요청 체크
    const existingRequest = await this.rewardRequestModel
      .findOne({ userId, eventId })
      .exec();
      
    if (existingRequest) {
      throw new ConflictException('이미 이 이벤트에 대한 보상을 요청했습니다');
    }
    
    // 새 보상 요청 생성
    const newRequest = new this.rewardRequestModel({
      userId,
      eventId,
      status: RequestStatus.PENDING,
    });
    
    return newRequest.save();
  }

  /**
   * 사용자별 보상 요청 목록 조회
   * @param userId 사용자 ID
   * @returns 보상 요청 목록
   */
  async findRequestsByUserId(userId: string): Promise<RewardRequest[]> {
    return this.rewardRequestModel
      .find({ userId })
      .populate('eventId')
      .exec();
  }

  /**
   * 모든 보상 요청 목록 조회 (필터링 가능)
   * @param query 쿼리 파라미터 (상태별, 이벤트별 필터링)
   * @returns 보상 요청 목록
   */
  async findAllRequests(query?: any): Promise<RewardRequest[]> {
    let filter = {};
    
    if (query && query.status) {
      filter = { ...filter, status: query.status };
    }
    
    if (query && query.eventId) {
      filter = { ...filter, eventId: query.eventId };
    }
    
    return this.rewardRequestModel
      .find(filter)
      .populate('eventId')
      .exec();
  }

  /**
   * 보상 요청 상태 업데이트 (관리자용)
   * @param requestId 보상 요청 ID
   * @param status 새 상태 (PENDING, APPROVED, REJECTED)
   * @param reason 사유 (선택적)
   * @returns 업데이트된 보상 요청 정보
   */
  async updateRequestStatus(
    requestId: string,
    status: RequestStatus,
    reason?: string,
  ): Promise<RewardRequest> {
    const request = await this.rewardRequestModel.findById(requestId).exec();
    if (!request) {
      throw new NotFoundException('보상 요청을 찾을 수 없습니다');
    }
    
    request.status = status;
    if (reason) {
      request.reason = reason;
    }
    
    return request.save();
  }
}
