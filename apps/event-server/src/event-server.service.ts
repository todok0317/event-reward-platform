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

  // Event methods
  async createEvent(createEventDto: CreateEventDto): Promise<Event> {
    const newEvent = new this.eventModel(createEventDto);
    return newEvent.save();
  }

  async findAllEvents(): Promise<Event[]> {
    return this.eventModel.find().exec();
  }

  async findEventById(id: string): Promise<Event> {
    const event = await this.eventModel.findById(id).exec();
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async updateEvent(id: string, updateEventDto: UpdateEventDto): Promise<Event> {
    const updatedEvent = await this.eventModel
      .findByIdAndUpdate(id, updateEventDto, { new: true })
      .exec();
    
    if (!updatedEvent) {
      throw new NotFoundException('Event not found');
    }
    
    return updatedEvent;
  }

  // Reward methods
  async createReward(eventId: string, createRewardDto: CreateRewardDto): Promise<Reward> {
    // Check if event exists
    const event = await this.eventModel.findById(eventId).exec();
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    
    const newReward = new this.rewardModel({
      ...createRewardDto,
      eventId,
    });
    
    return newReward.save();
  }

  async findRewardsByEventId(eventId: string): Promise<Reward[]> {
    return this.rewardModel.find({ eventId }).exec();
  }

  // Reward request methods
  async requestReward(eventId: string, rewardRequestDto: RewardRequestDto): Promise<RewardRequest> {
    const { userId } = rewardRequestDto;
    
    // Check if event exists
    const event = await this.eventModel.findById(eventId).exec();
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    
    // Check if event is active
    if (!event.isActive) {
      throw new BadRequestException('Event is not active');
    }
    
    // Check if event period is valid
    const currentDate = new Date();
    if (currentDate < event.startDate || currentDate > event.endDate) {
      throw new BadRequestException('Event is not in progress');
    }
    
    // Check if user already requested reward for this event
    const existingRequest = await this.rewardRequestModel
      .findOne({ userId, eventId })
      .exec();
      
    if (existingRequest) {
      throw new ConflictException('Reward already requested for this event');
    }
    
    // Create new reward request
    const newRequest = new this.rewardRequestModel({
      userId,
      eventId,
      status: RequestStatus.PENDING,
    });
    
    return newRequest.save();
  }

  async findRequestsByUserId(userId: string): Promise<RewardRequest[]> {
    return this.rewardRequestModel
      .find({ userId })
      .populate('eventId')
      .exec();
  }

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

  // For admin to manually approve/reject reward requests
  async updateRequestStatus(
    requestId: string,
    status: RequestStatus,
    reason?: string,
  ): Promise<RewardRequest> {
    const request = await this.rewardRequestModel.findById(requestId).exec();
    if (!request) {
      throw new NotFoundException('Reward request not found');
    }
    
    request.status = status;
    if (reason) {
      request.reason = reason;
    }
    
    return request.save();
  }
}
