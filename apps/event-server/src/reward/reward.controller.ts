import { Controller, Post, Get, Param, Req, UseGuards, Query, Body, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { RewardRequest, RewardRequestDocument, RequestStatus } from '../models/reward-request.schema';
import { Event, EventDocument } from '../models/event.schema';
import { RewardProcessorService } from './reward-processor.service';

@Controller('rewards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RewardController {
  constructor(
    @InjectModel(RewardRequest.name) private rewardRequestModel: Model<RewardRequestDocument>,
    @InjectModel(Event.name) private eventModel: Model<EventDocument>,
    private readonly rewardProcessorService: RewardProcessorService
  ) {}

  /**
   * 보상 요청 API
   * 사용자가 특정 이벤트에 대한 보상을 요청합니다.
   */
  @Post('request/:eventId')
  @Roles('USER')
  async requestReward(@Param('eventId') eventId: string, @Req() req: any) {
    const userId = req.user.userId;

    // 1. 이벤트 존재 확인
    const event = await this.eventModel.findById(eventId).exec();
    if (!event) {
      throw new NotFoundException('이벤트를 찾을 수 없습니다');
    }

    // 2. 이벤트 활성화 상태 확인
    if (!event.isActive) {
      throw new ForbiddenException('비활성화된 이벤트입니다');
    }

    // 3. 이벤트 기간 확인
    const now = new Date();
    if (now < event.startDate || now > event.endDate) {
      throw new ForbiddenException('이벤트 기간이 아닙니다');
    }

    // 4. 중복 요청 확인
    const existingRequest = await this.rewardRequestModel.findOne({
      userId,
      eventId,
      status: { $in: [RequestStatus.APPROVED, RequestStatus.PENDING] }
    }).exec();

    if (existingRequest) {
      throw new ConflictException('이미 처리 중이거나 승인된 요청이 있습니다');
    }

    // 5. 요청 생성
    const newRequest = new this.rewardRequestModel({
      userId,
      eventId,
      status: RequestStatus.PENDING,
    });
    
    const savedRequest = await newRequest.save();

    // 6. 사가 트랜잭션 시작
    await this.rewardProcessorService.startRewardRequest(
      userId, 
      eventId, 
      savedRequest._id.toString()
    );

    return {
      requestId: savedRequest._id,
      status: savedRequest.status,
      message: '보상 요청이 성공적으로 접수되었습니다. 처리 중입니다.'
    };
  }

  /**
   * 사용자 보상 요청 내역 조회
   */
  @Get('request/user')
  @Roles('USER')
  async getUserRewardRequests(@Req() req: any) {
    const userId = req.user.userId;
    
    const requests = await this.rewardRequestModel.find({ userId })
      .populate('eventId')
      .sort({ createdAt: -1 })
      .exec();
      
    return requests;
  }

  /**
   * 모든 보상 요청 내역 조회 (관리자용)
   */
  @Get('request')
  @Roles('OPERATOR', 'AUDITOR', 'ADMIN')
  async getAllRewardRequests(
    @Query('status') status?: RequestStatus,
    @Query('eventId') eventId?: string
  ) {
    // 쿼리 필터 구성
    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (eventId) {
      filter.eventId = eventId;
    }
    
    const requests = await this.rewardRequestModel.find(filter)
      .populate('eventId')
      .sort({ createdAt: -1 })
      .exec();
      
    return requests;
  }
}
