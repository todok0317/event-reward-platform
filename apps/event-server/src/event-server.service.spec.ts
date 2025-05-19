import { Test, TestingModule } from '@nestjs/testing';
import { EventServerService } from './event-server.service';
import { getModelToken } from '@nestjs/mongoose';
import { Event } from './models/event.schema';
import { Reward } from './models/reward.schema';
import { RewardRequest, RequestStatus } from './models/reward-request.schema';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

describe('EventServerService', () => {
  let service: EventServerService;
  let eventModel: any;
  let rewardModel: any;
  let rewardRequestModel: any;

  beforeEach(async () => {
    const mockEventModel = {
      findById: jest.fn(),
      find: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      constructor: jest.fn().mockImplementation((dto) => ({
        ...dto,
        save: jest.fn().mockResolvedValue({
          _id: 'event-id',
          ...dto,
        }),
      })),
    };

    const mockRewardModel = {
      find: jest.fn(),
      constructor: jest.fn().mockImplementation((dto) => ({
        ...dto,
        save: jest.fn().mockResolvedValue({
          _id: 'reward-id',
          ...dto,
        }),
      })),
    };

    const mockRewardRequestModel = {
      findOne: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      constructor: jest.fn().mockImplementation((dto) => ({
        ...dto,
        save: jest.fn().mockResolvedValue({
          _id: 'request-id',
          ...dto,
        }),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventServerService,
        { provide: getModelToken(Event.name), useValue: mockEventModel },
        { provide: getModelToken(Reward.name), useValue: mockRewardModel },
        { provide: getModelToken(RewardRequest.name), useValue: mockRewardRequestModel },
      ],
    }).compile();

    service = module.get<EventServerService>(EventServerService);
    eventModel = module.get(getModelToken(Event.name));
    rewardModel = module.get(getModelToken(Reward.name));
    rewardRequestModel = module.get(getModelToken(RewardRequest.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Event Management', () => {
    describe('createEvent', () => {
      it('should create a new event', async () => {
        const createEventDto = {
          title: 'Test Event',
          description: 'Event Description',
          condition: 'Login 3 days',
          startDate: new Date('2025-05-15'),
          endDate: new Date('2025-06-15'),
          isActive: true,
        };

        const result = await service.createEvent(createEventDto);

        expect(result).toEqual({
          _id: 'event-id',
          ...createEventDto,
        });
      });
    });

    describe('findAllEvents', () => {
      it('should return all events', async () => {
        const mockEvents = [
          { _id: 'event-1', title: 'Event 1' },
          { _id: 'event-2', title: 'Event 2' },
        ];
        eventModel.find.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEvents),
        });

        const result = await service.findAllEvents();

        expect(eventModel.find).toHaveBeenCalled();
        expect(result).toEqual(mockEvents);
      });

      it('should return empty array if no events exist', async () => {
        eventModel.find.mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        });

        const result = await service.findAllEvents();

        expect(eventModel.find).toHaveBeenCalled();
        expect(result).toEqual([]);
      });
    });

    describe('findEventById', () => {
      it('should return event by id', async () => {
        const mockEvent = { _id: 'event-id', title: 'Test Event' };
        eventModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEvent),
        });

        const result = await service.findEventById('event-id');

        expect(eventModel.findById).toHaveBeenCalledWith('event-id');
        expect(result).toEqual(mockEvent);
      });

      it('should throw NotFoundException if event not found', async () => {
        eventModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });

        await expect(service.findEventById('non-existent-id')).rejects.toThrow(
          new NotFoundException('Event not found')
        );
        
        expect(eventModel.findById).toHaveBeenCalledWith('non-existent-id');
      });
    });

    describe('updateEvent', () => {
      it('should update an event', async () => {
        const updateEventDto = {
          title: 'Updated Event',
          isActive: false,
        };
        const mockUpdatedEvent = {
          _id: 'event-id',
          title: 'Updated Event',
          description: 'Original Description',
          isActive: false,
        };
        eventModel.findByIdAndUpdate.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockUpdatedEvent),
        });

        const result = await service.updateEvent('event-id', updateEventDto);

        expect(eventModel.findByIdAndUpdate).toHaveBeenCalledWith(
          'event-id',
          updateEventDto,
          { new: true }
        );
        expect(result).toEqual(mockUpdatedEvent);
      });

      it('should throw NotFoundException if event not found for update', async () => {
        eventModel.findByIdAndUpdate.mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });

        await expect(service.updateEvent('non-existent-id', { title: 'New Title' })).rejects.toThrow(
          new NotFoundException('Event not found')
        );
        
        expect(eventModel.findByIdAndUpdate).toHaveBeenCalled();
      });
    });
  });

  describe('Reward Management', () => {
    describe('createReward', () => {
      it('should create a new reward for an event', async () => {
        const eventId = 'event-id';
        const createRewardDto = {
          name: 'Test Reward',
          description: 'Reward Description',
          type: 'POINT',
          amount: 100,
        };

        const mockEvent = { _id: eventId, title: 'Test Event' };
        eventModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEvent),
        });

        const result = await service.createReward(eventId, createRewardDto);

        expect(eventModel.findById).toHaveBeenCalledWith(eventId);
        expect(result).toEqual({
          _id: 'reward-id',
          ...createRewardDto,
          eventId,
        });
      });

      it('should throw NotFoundException if event not found when creating reward', async () => {
        eventModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });

        await expect(
          service.createReward('non-existent-id', {
            name: 'Test Reward',
            description: 'Reward Description',
            type: 'POINT',
            amount: 100,
          })
        ).rejects.toThrow(new NotFoundException('Event not found'));
        
        expect(eventModel.findById).toHaveBeenCalledWith('non-existent-id');
      });
    });

    describe('findRewardsByEventId', () => {
      it('should return rewards for an event', async () => {
        const eventId = 'event-id';
        const mockRewards = [
          { _id: 'reward-1', name: 'Reward 1', eventId },
          { _id: 'reward-2', name: 'Reward 2', eventId },
        ];
        rewardModel.find.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockRewards),
        });

        const result = await service.findRewardsByEventId(eventId);

        expect(rewardModel.find).toHaveBeenCalledWith({ eventId });
        expect(result).toEqual(mockRewards);
      });

      it('should return empty array if no rewards exist for event', async () => {
        const eventId = 'event-id';
        rewardModel.find.mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        });

        const result = await service.findRewardsByEventId(eventId);

        expect(rewardModel.find).toHaveBeenCalledWith({ eventId });
        expect(result).toEqual([]);
      });
    });
  });

  describe('Reward Request Management', () => {
    describe('requestReward', () => {
      it('should create a new reward request', async () => {
        const eventId = 'event-id';
        const rewardRequestDto = { userId: 'user-id' };

        // Mocking an active event within valid date range
        const today = new Date();
        const mockEvent = {
          _id: eventId,
          title: 'Test Event',
          isActive: true,
          startDate: new Date(today.getTime() - 86400000), // yesterday
          endDate: new Date(today.getTime() + 86400000),   // tomorrow
        };
        eventModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEvent),
        });
        
        // No existing request
        rewardRequestModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });

        const result = await service.requestReward(eventId, rewardRequestDto);

        expect(eventModel.findById).toHaveBeenCalledWith(eventId);
        expect(rewardRequestModel.findOne).toHaveBeenCalledWith({ userId: 'user-id', eventId });
        expect(result).toEqual({
          _id: 'request-id',
          userId: 'user-id',
          eventId,
          status: RequestStatus.PENDING,
        });
      });

      it('should throw NotFoundException if event not found when requesting reward', async () => {
        eventModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        });

        await expect(
          service.requestReward('non-existent-id', { userId: 'user-id' })
        ).rejects.toThrow(new NotFoundException('Event not found'));
        
        expect(eventModel.findById).toHaveBeenCalledWith('non-existent-id');
      });

      it('should throw BadRequestException if event is not active', async () => {
        const mockEvent = {
          _id: 'event-id',
          title: 'Test Event',
          isActive: false,
          startDate: new Date('2025-05-01'),
          endDate: new Date('2025-06-01'),
        };
        eventModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEvent),
        });

        await expect(
          service.requestReward('event-id', { userId: 'user-id' })
        ).rejects.toThrow(new BadRequestException('Event is not active'));
        
        expect(eventModel.findById).toHaveBeenCalledWith('event-id');
      });

      it('should throw BadRequestException if event is not in progress (before start date)', async () => {
        const today = new Date();
        const tomorrow = new Date(today.getTime() + 86400000);
        const dayAfterTomorrow = new Date(today.getTime() + 172800000);
        
        const mockEvent = {
          _id: 'event-id',
          title: 'Test Event',
          isActive: true,
          startDate: tomorrow,
          endDate: dayAfterTomorrow,
        };
        eventModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEvent),
        });

        await expect(
          service.requestReward('event-id', { userId: 'user-id' })
        ).rejects.toThrow(new BadRequestException('Event is not in progress'));
        
        expect(eventModel.findById).toHaveBeenCalledWith('event-id');
      });

      it('should throw BadRequestException if event is not in progress (after end date)', async () => {
        const today = new Date();
        const yesterday = new Date(today.getTime() - 86400000);
        const dayBeforeYesterday = new Date(today.getTime() - 172800000);
        
        const mockEvent = {
          _id: 'event-id',
          title: 'Test Event',
          isActive: true,
          startDate: dayBeforeYesterday,
          endDate: yesterday,
        };
        eventModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEvent),
        });

        await expect(
          service.requestReward('event-id', { userId: 'user-id' })
        ).rejects.toThrow(new BadRequestException('Event is not in progress'));
        
        expect(eventModel.findById).toHaveBeenCalledWith('event-id');
      });

      it('should throw ConflictException if reward already requested', async () => {
        const today = new Date();
        const mockEvent = {
          _id: 'event-id',
          title: 'Test Event',
          isActive: true,
          startDate: new Date(today.getTime() - 86400000), // yesterday
          endDate: new Date(today.getTime() + 86400000),   // tomorrow
        };
        eventModel.findById.mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockEvent),
        });
        
        // Existing request
        const existingRequest = { 
          _id: 'request-id', 
          userId: 'user-id', 
          eventId: 'event-id',
          status: RequestStatus.PENDING 
        };
        rewardRequestModel.findOne.mockReturnValue({
          exec: jest.fn().mockResolvedValue(existingRequest),
        });

        await expect(
          service.requestReward('event-id', { userId: 'user-id' })
        ).rejects.toThrow(new ConflictException('Reward already requested for this event'));
        
        expect(rewardRequestModel.findOne).toHaveBeenCalledWith({ userId: 'user-id', eventId: 'event-id' });
      });
    });

    describe('findRequestsByUserId', () => {
      it('should return reward requests for a user', async () => {
        const userId = 'user-id';
        const mockRequests = [
          { _id: 'request-1', userId, eventId: 'event-1', status: RequestStatus.PENDING },
          { _id: 'request-2', userId, eventId: 'event-2', status: RequestStatus.APPROVED },
        ];
        rewardRequestModel.find.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockRequests),
          }),
        });

        const result = await service.findRequestsByUserId(userId);

        expect(rewardRequestModel.find).toHaveBeenCalledWith({ userId });
        expect(result).toEqual(mockRequests);
      });

      it('should return empty array if no requests exist for user', async () => {
        const userId = 'user-id';
        rewardRequestModel.find.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        });

        const result = await service.findRequestsByUserId(userId);

        expect(rewardRequestModel.find).toHaveBeenCalledWith({ userId });
        expect(result).toEqual([]);
      });
    });

    describe('findAllRequests', () => {
      it('should return all reward requests', async () => {
        const mockRequests = [
          { _id: 'request-1', userId: 'user-1', eventId: 'event-1', status: RequestStatus.PENDING },
          { _id: 'request-2', userId: 'user-2', eventId: 'event-2', status: RequestStatus.APPROVED },
        ];
        rewardRequestModel.find.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockRequests),
          }),
        });

        const result = await service.findAllRequests();

        expect(rewardRequestModel.find).toHaveBeenCalledWith({});
        expect(result).toEqual(mockRequests);
      });

      it('should filter requests by status', async () => {
        const mockRequests = [
          { _id: 'request-1', userId: 'user-1', eventId: 'event-1', status: RequestStatus.PENDING },
        ];
        rewardRequestModel.find.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockRequests),
          }),
        });

        const result = await service.findAllRequests({ status: RequestStatus.PENDING });

        expect(rewardRequestModel.find).toHaveBeenCalledWith({ status: RequestStatus.PENDING });
        expect(result).toEqual(mockRequests);
      });

      it('should filter requests by eventId', async () => {
        const eventId = 'event-1';
        const mockRequests = [
          { _id: 'request-1', userId: 'user-1', eventId, status: RequestStatus.PENDING },
          { _id: 'request-2', userId: 'user-2', eventId, status: RequestStatus.APPROVED },
        ];
        rewardRequestModel.find.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockRequests),
          }),
        });

        const result = await service.findAllRequests({ eventId });

        expect(rewardRequestModel.find).toHaveBeenCalledWith({ eventId });
        expect(result).toEqual(mockRequests);
      });

      it('should combine multiple filters', async () => {
        const eventId = 'event-1';
        const status = RequestStatus.PENDING;
        const mockRequests = [
          { _id: 'request-1', userId: 'user-1', eventId, status },
        ];
        rewardRequestModel.find.mockReturnValue({
          populate: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockRequests),
          }),
        });

        const result = await service.findAllRequests({ eventId, status });

        expect(rewardRequestModel.find).toHaveBeenCalledWith({ eventId, status });
        expect(result).toEqual(mockRequests);
      });
    });

    describe('updateRequestStatus', () => {
      it('should update reward request status', async () => {
        const requestId = 'request-id';
        const mockRequest = {
          _id: requestId,
          userId: 'user-id',
          eventId: 'event-id',
          status: RequestStatus.PENDING,
          save: jest.fn().mockResolvedValue({
            _id: requestId,
            userId: 'user-id',
            eventId: 'event-id',
            status: RequestStatus.APPROVED,
            reason: 'Approved by admin',
          }),
        };
        rewardRequestModel.findById.mockResolvedValue(mockRequest);

        const result = await service.updateRequestStatus(
          requestId, 
          RequestStatus.APPROVED, 
          'Approved by admin'
        );

        expect(rewardRequestModel.findById).toHaveBeenCalledWith(requestId);
        expect(mockRequest.status).toBe(RequestStatus.APPROVED);
        expect(mockRequest.reason).toBe('Approved by admin');
        expect(mockRequest.save).toHaveBeenCalled();
        expect(result).toEqual({
          _id: requestId,
          userId: 'user-id',
          eventId: 'event-id',
          status: RequestStatus.APPROVED,
          reason: 'Approved by admin',
        });
      });

      it('should update status without reason', async () => {
        const requestId = 'request-id';
        const mockRequest = {
          _id: requestId,
          userId: 'user-id',
          eventId: 'event-id',
          status: RequestStatus.PENDING,
          save: jest.fn().mockResolvedValue({
            _id: requestId,
            userId: 'user-id',
            eventId: 'event-id',
            status: RequestStatus.APPROVED,
          }),
        };
        rewardRequestModel.findById.mockResolvedValue(mockRequest);

        const result = await service.updateRequestStatus(requestId, RequestStatus.APPROVED);

        expect(rewardRequestModel.findById).toHaveBeenCalledWith(requestId);
        expect(mockRequest.status).toBe(RequestStatus.APPROVED);
        expect(mockRequest.reason).toBeUndefined();
        expect(mockRequest.save).toHaveBeenCalled();
      });

      it('should throw NotFoundException if request not found', async () => {
        rewardRequestModel.findById.mockResolvedValue(null);

        await expect(
          service.updateRequestStatus('non-existent-id', RequestStatus.APPROVED)
        ).rejects.toThrow(new NotFoundException('Reward request not found'));
        
        expect(rewardRequestModel.findById).toHaveBeenCalledWith('non-existent-id');
      });
    });
  });
});
