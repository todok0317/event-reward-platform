import { Test, TestingModule } from '@nestjs/testing';
import { EventServerController } from './event-server.controller';
import { EventServerService } from './event-server.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { RequestStatus } from './models/reward-request.schema';

describe('EventServerController', () => {
  let controller: EventServerController;
  let service: EventServerService;

  beforeEach(async () => {
    const mockEventServerService = {
      createEvent: jest.fn(),
      findAllEvents: jest.fn(),
      findEventById: jest.fn(),
      updateEvent: jest.fn(),
      createReward: jest.fn(),
      findRewardsByEventId: jest.fn(),
      requestReward: jest.fn(),
      findRequestsByUserId: jest.fn(),
      findAllRequests: jest.fn(),
      updateRequestStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventServerController],
      providers: [
        {
          provide: EventServerService,
          useValue: mockEventServerService,
        },
      ],
    }).compile();

    controller = module.get<EventServerController>(EventServerController);
    service = module.get<EventServerService>(EventServerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createEvent', () => {
    it('should create a new event', async () => {
      const createEventDto = {
        title: 'Test Event',
        description: 'Event Description',
        condition: 'Login 3 days',
        startDate: '2025-05-15T00:00:00.000Z',
        endDate: '2025-06-15T00:00:00.000Z',
        isActive: true,
      };
      const expectedResult = {
        _id: 'event-id',
        ...createEventDto,
        startDate: new Date(createEventDto.startDate),
        endDate: new Date(createEventDto.endDate),
      };
      
      jest.spyOn(service, 'createEvent').mockResolvedValue(expectedResult);
      
      const result = await controller.createEvent(createEventDto);
      
      expect(service.createEvent).toHaveBeenCalledWith(createEventDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAllEvents', () => {
    it('should return all events', async () => {
      const expectedResult = [
        { _id: 'event-1', title: 'Event 1' },
        { _id: 'event-2', title: 'Event 2' },
      ];
      
      jest.spyOn(service, 'findAllEvents').mockResolvedValue(expectedResult);
      
      const result = await controller.findAllEvents();
      
      expect(service.findAllEvents).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findEventById', () => {
    it('should return event by id', async () => {
      const eventId = 'event-123';
      const expectedResult = {
        _id: eventId,
        title: 'Test Event',
        description: 'Event Description',
      };
      
      jest.spyOn(service, 'findEventById').mockResolvedValue(expectedResult);
      
      const result = await controller.findEventById(eventId);
      
      expect(service.findEventById).toHaveBeenCalledWith(eventId);
      expect(result).toEqual(expectedResult);
    });

    it('should handle not found when event does not exist', async () => {
      const eventId = 'non-existent-id';
      
      jest.spyOn(service, 'findEventById').mockRejectedValue(
        new NotFoundException('Event not found')
      );
      
      await expect(controller.findEventById(eventId)).rejects.toThrow(NotFoundException);
      expect(service.findEventById).toHaveBeenCalledWith(eventId);
    });
  });

  describe('updateEvent', () => {
    it('should update an event', async () => {
      const eventId = 'event-123';
      const updateEventDto = {
        title: 'Updated Event',
        isActive: false,
      };
      const expectedResult = {
        _id: eventId,
        title: 'Updated Event',
        description: 'Original Description',
        isActive: false,
      };
      
      jest.spyOn(service, 'updateEvent').mockResolvedValue(expectedResult);
      
      const result = await controller.updateEvent(eventId, updateEventDto);
      
      expect(service.updateEvent).toHaveBeenCalledWith(eventId, updateEventDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('createReward', () => {
    it('should create a new reward for an event', async () => {
      const eventId = 'event-123';
      const createRewardDto = {
        name: 'Test Reward',
        description: 'Reward Description',
        type: 'POINT',
        amount: 100,
      };
      const expectedResult = {
        _id: 'reward-id',
        ...createRewardDto,
        eventId,
      };
      
      jest.spyOn(service, 'createReward').mockResolvedValue(expectedResult);
      
      const result = await controller.createReward(eventId, createRewardDto);
      
      expect(service.createReward).toHaveBeenCalledWith(eventId, createRewardDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle not found when event does not exist', async () => {
      const eventId = 'non-existent-id';
      const createRewardDto = {
        name: 'Test Reward',
        description: 'Reward Description',
        type: 'POINT',
        amount: 100,
      };
      
      jest.spyOn(service, 'createReward').mockRejectedValue(
        new NotFoundException('Event not found')
      );
      
      await expect(controller.createReward(eventId, createRewardDto)).rejects.toThrow(NotFoundException);
      expect(service.createReward).toHaveBeenCalledWith(eventId, createRewardDto);
    });
  });

  describe('findRewardsByEventId', () => {
    it('should return rewards for an event', async () => {
      const eventId = 'event-123';
      const expectedResult = [
        { _id: 'reward-1', name: 'Reward 1', eventId },
        { _id: 'reward-2', name: 'Reward 2', eventId },
      ];
      
      jest.spyOn(service, 'findRewardsByEventId').mockResolvedValue(expectedResult);
      
      const result = await controller.findRewardsByEventId(eventId);
      
      expect(service.findRewardsByEventId).toHaveBeenCalledWith(eventId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('requestReward', () => {
    it('should create a new reward request', async () => {
      const eventId = 'event-123';
      const rewardRequestDto = { userId: 'user-id' };
      const expectedResult = {
        _id: 'request-id',
        userId: 'user-id',
        eventId,
        status: 'PENDING',
      };
      
      jest.spyOn(service, 'requestReward').mockResolvedValue(expectedResult);
      
      const result = await controller.requestReward(eventId, rewardRequestDto);
      
      expect(service.requestReward).toHaveBeenCalledWith(eventId, rewardRequestDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle validation errors when requesting reward', async () => {
      const eventId = 'event-123';
      const rewardRequestDto = { userId: 'user-id' };
      
      jest.spyOn(service, 'requestReward').mockRejectedValue(
        new BadRequestException('Event is not active')
      );
      
      await expect(controller.requestReward(eventId, rewardRequestDto)).rejects.toThrow(BadRequestException);
      expect(service.requestReward).toHaveBeenCalledWith(eventId, rewardRequestDto);
    });

    it('should handle conflict when reward already requested', async () => {
      const eventId = 'event-123';
      const rewardRequestDto = { userId: 'user-id' };
      
      jest.spyOn(service, 'requestReward').mockRejectedValue(
        new ConflictException('Reward already requested for this event')
      );
      
      await expect(controller.requestReward(eventId, rewardRequestDto)).rejects.toThrow(ConflictException);
      expect(service.requestReward).toHaveBeenCalledWith(eventId, rewardRequestDto);
    });
  });

  describe('findRequestsByUserId', () => {
    it('should return reward requests for a user', async () => {
      const userId = 'user-id';
      const expectedResult = [
        { _id: 'request-1', userId, eventId: 'event-1', status: 'PENDING' },
        { _id: 'request-2', userId, eventId: 'event-2', status: 'APPROVED' },
      ];
      
      jest.spyOn(service, 'findRequestsByUserId').mockResolvedValue(expectedResult);
      
      const result = await controller.findRequestsByUserId(userId);
      
      expect(service.findRequestsByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAllRequests', () => {
    it('should return all reward requests', async () => {
      const expectedResult = [
        { _id: 'request-1', userId: 'user-1', eventId: 'event-1', status: 'PENDING' },
        { _id: 'request-2', userId: 'user-2', eventId: 'event-2', status: 'APPROVED' },
      ];
      
      jest.spyOn(service, 'findAllRequests').mockResolvedValue(expectedResult);
      
      const result = await controller.findAllRequests({});
      
      expect(service.findAllRequests).toHaveBeenCalledWith({});
      expect(result).toEqual(expectedResult);
    });

    it('should filter requests by status', async () => {
      const query = { status: 'PENDING' };
      const expectedResult = [
        { _id: 'request-1', userId: 'user-1', eventId: 'event-1', status: 'PENDING' },
      ];
      
      jest.spyOn(service, 'findAllRequests').mockResolvedValue(expectedResult);
      
      const result = await controller.findAllRequests(query);
      
      expect(service.findAllRequests).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateRequestStatus', () => {
    it('should update reward request status', async () => {
      const requestId = 'request-id';
      const body = { status: RequestStatus.APPROVED, reason: 'Approved by admin' };
      const expectedResult = {
        _id: requestId,
        userId: 'user-id',
        eventId: 'event-id',
        status: RequestStatus.APPROVED,
        reason: 'Approved by admin',
      };
      
      jest.spyOn(service, 'updateRequestStatus').mockResolvedValue(expectedResult);
      
      const result = await controller.updateRequestStatus(requestId, body);
      
      expect(service.updateRequestStatus).toHaveBeenCalledWith(
        requestId,
        body.status,
        body.reason
      );
      expect(result).toEqual(expectedResult);
    });
  });
});
