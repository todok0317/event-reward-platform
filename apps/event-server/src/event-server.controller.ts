import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { EventServerService } from './event-server.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { CreateRewardDto, RewardRequestDto } from './dto/reward.dto';
import { RequestStatus } from './models/reward-request.schema';

/**
 * Event Server 컨트롤러
 * 이벤트, 보상, 보상 요청 관리 API 제공
 */
@Controller()
export class EventServerController {
  constructor(private readonly eventServerService: EventServerService) {}

  // 이벤트 관련 라우트
  /**
   * 이벤트 생성 API
   * @param createEventDto 이벤트 생성 DTO
   * @returns 생성된 이벤트 정보
   */
  @Post('events')
  createEvent(@Body() createEventDto: CreateEventDto) {
    return this.eventServerService.createEvent(createEventDto);
  }

  /**
   * 이벤트 목록 조회 API
   * @returns 이벤트 목록
   */
  @Get('events')
  findAllEvents() {
    return this.eventServerService.findAllEvents();
  }

  /**
   * 특정 이벤트 조회 API
   * @param id 이벤트 ID
   * @returns 이벤트 정보
   */
  @Get('events/:id')
  findEventById(@Param('id') id: string) {
    return this.eventServerService.findEventById(id);
  }

  /**
   * 이벤트 업데이트 API
   * @param id 이벤트 ID
   * @param updateEventDto 이벤트 업데이트 DTO
   * @returns 업데이트된 이벤트 정보
   */
  @Put('events/:id')
  updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventServerService.updateEvent(id, updateEventDto);
  }

  // 보상 관련 라우트
  /**
   * 보상 생성 API
   * @param eventId 이벤트 ID
   * @param createRewardDto 보상 생성 DTO
   * @returns 생성된 보상 정보
   */
  @Post('events/:eventId/rewards')
  createReward(
    @Param('eventId') eventId: string,
    @Body() createRewardDto: CreateRewardDto,
  ) {
    return this.eventServerService.createReward(eventId, createRewardDto);
  }

  /**
   * 이벤트별 보상 목록 조회 API
   * @param eventId 이벤트 ID
   * @returns 보상 목록
   */
  @Get('events/:eventId/rewards')
  findRewardsByEventId(@Param('eventId') eventId: string) {
    return this.eventServerService.findRewardsByEventId(eventId);
  }

  // 보상 요청 관련 라우트
  /**
   * 보상 요청 API
   * @param eventId 이벤트 ID
   * @param rewardRequestDto 보상 요청 DTO
   * @returns 생성된 보상 요청 정보
   */
  @Post('rewards/request/:eventId')
  requestReward(
    @Param('eventId') eventId: string,
    @Body() rewardRequestDto: RewardRequestDto,
  ) {
    return this.eventServerService.requestReward(eventId, rewardRequestDto);
  }

  /**
   * 사용자별 보상 요청 목록 조회 API
   * @param userId 사용자 ID
   * @returns 보상 요청 목록
   */
  @Get('rewards/request/user/:userId')
  findRequestsByUserId(@Param('userId') userId: string) {
    return this.eventServerService.findRequestsByUserId(userId);
  }

  /**
   * 모든 보상 요청 목록 조회 API (필터링 가능)
   * @param query 필터링 쿼리 파라미터
   * @returns 보상 요청 목록
   */
  @Get('rewards/request')
  findAllRequests(@Query() query: any) {
    return this.eventServerService.findAllRequests(query);
  }

  /**
   * 보상 요청 상태 업데이트 API
   * @param requestId 보상 요청 ID
   * @param body 상태 업데이트 정보 (status, reason)
   * @returns 업데이트된 보상 요청 정보
   */
  @Put('rewards/request/:requestId/status')
  updateRequestStatus(
    @Param('requestId') requestId: string,
    @Body() body: { status: RequestStatus; reason?: string },
  ) {
    return this.eventServerService.updateRequestStatus(
      requestId,
      body.status,
      body.reason,
    );
  }
}
