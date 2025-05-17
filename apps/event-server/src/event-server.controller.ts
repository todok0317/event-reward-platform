import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { EventServerService } from './event-server.service';
import { CreateEventDto, UpdateEventDto } from './dto/event.dto';
import { CreateRewardDto, RewardRequestDto } from './dto/reward.dto';
import { RequestStatus } from './models/reward-request.schema';

@Controller()
export class EventServerController {
  constructor(private readonly eventServerService: EventServerService) {}

  // Event routes
  @Post('events')
  createEvent(@Body() createEventDto: CreateEventDto) {
    return this.eventServerService.createEvent(createEventDto);
  }

  @Get('events')
  findAllEvents() {
    return this.eventServerService.findAllEvents();
  }

  @Get('events/:id')
  findEventById(@Param('id') id: string) {
    return this.eventServerService.findEventById(id);
  }

  @Put('events/:id')
  updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventServerService.updateEvent(id, updateEventDto);
  }

  // Reward routes
  @Post('events/:eventId/rewards')
  createReward(
    @Param('eventId') eventId: string,
    @Body() createRewardDto: CreateRewardDto,
  ) {
    return this.eventServerService.createReward(eventId, createRewardDto);
  }

  @Get('events/:eventId/rewards')
  findRewardsByEventId(@Param('eventId') eventId: string) {
    return this.eventServerService.findRewardsByEventId(eventId);
  }

  // Reward request routes
  @Post('rewards/request/:eventId')
  requestReward(
    @Param('eventId') eventId: string,
    @Body() rewardRequestDto: RewardRequestDto,
  ) {
    return this.eventServerService.requestReward(eventId, rewardRequestDto);
  }

  @Get('rewards/request/user/:userId')
  findRequestsByUserId(@Param('userId') userId: string) {
    return this.eventServerService.findRequestsByUserId(userId);
  }

  @Get('rewards/request')
  findAllRequests(@Query() query: any) {
    return this.eventServerService.findAllRequests(query);
  }

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
