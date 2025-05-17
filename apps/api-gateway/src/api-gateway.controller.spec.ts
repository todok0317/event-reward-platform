import { Test, TestingModule } from '@nestjs/testing';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { HttpModule } from './http/http.module';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UnauthorizedException } from '@nestjs/common';

describe('ApiGatewayController', () => {
  let apiGatewayController: ApiGatewayController;
  let apiGatewayService: ApiGatewayService;

  beforeEach(async () => {
    const mockApiGatewayService = {
      forwardAuthRequest: jest.fn(),
      forwardEventRequest: jest.fn(),
    };

    const app: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        PassportModule,
        JwtModule.register({
          secret: 'test-secret',
          signOptions: { expiresIn: '1h' },
        }),
      ],
      controllers: [ApiGatewayController],
      providers: [
        {
          provide: ApiGatewayService,
          useValue: mockApiGatewayService,
        },
      ],
    }).compile();

    apiGatewayController = app.get<ApiGatewayController>(ApiGatewayController);
    apiGatewayService = app.get<ApiGatewayService>(ApiGatewayService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Auth Routes Tests
  describe('Auth Routes', () => {
    // Register
    describe('register', () => {
      it('should forward register request to auth service', async () => {
        const body = { username: 'test', password: 'test123' };
        const expectedResult = { username: 'test' };
        
        jest.spyOn(apiGatewayService, 'forwardAuthRequest').mockResolvedValue(expectedResult);
        
        const result = await apiGatewayController.register(body);
        
        expect(apiGatewayService.forwardAuthRequest).toHaveBeenCalledWith(
          'POST',
          '/auth/register',
          body
        );
        expect(result).toEqual(expectedResult);
      });
      
      it('should handle error during registration', async () => {
        const body = { username: 'test', password: 'test123' };
        
        jest.spyOn(apiGatewayService, 'forwardAuthRequest')
          .mockRejectedValue(new Error('Registration failed'));
        
        await expect(apiGatewayController.register(body)).rejects.toThrow('Registration failed');
      });
    });

    // Login
    describe('login', () => {
      it('should forward login request to auth service', async () => {
        const body = { username: 'test', password: 'test123' };
        const expectedResult = { access_token: 'jwt-token' };
        
        jest.spyOn(apiGatewayService, 'forwardAuthRequest').mockResolvedValue(expectedResult);
        
        const result = await apiGatewayController.login(body);
        
        expect(apiGatewayService.forwardAuthRequest).toHaveBeenCalledWith(
          'POST',
          '/auth/login',
          body
        );
        expect(result).toEqual(expectedResult);
      });
      
      it('should handle invalid credentials', async () => {
        const body = { username: 'test', password: 'wrong' };
        
        jest.spyOn(apiGatewayService, 'forwardAuthRequest')
          .mockRejectedValue(new UnauthorizedException('Invalid credentials'));
        
        await expect(apiGatewayController.login(body))
          .rejects.toThrow(UnauthorizedException);
      });
    });
    
    // Assign Role
    describe('assignRole', () => {
      it('should forward role assignment request to auth service', async () => {
        const userId = 'user-123';
        const body = { role: 'ADMIN' };
        const headers = { Authorization: 'Bearer token' };
        const expectedResult = { 
          _id: userId, 
          username: 'test',
          roles: ['USER', 'ADMIN']
        };
        
        jest.spyOn(apiGatewayService, 'forwardAuthRequest').mockResolvedValue(expectedResult);
        
        const result = await apiGatewayController.assignRole(userId, body, headers);
        
        expect(apiGatewayService.forwardAuthRequest).toHaveBeenCalledWith(
          'POST',
          `/auth/users/${userId}/role`,
          body,
          headers
        );
        expect(result).toEqual(expectedResult);
      });
    });
  });

  // Event Routes Tests
  describe('Event Routes', () => {
    // Create Event
    describe('createEvent', () => {
      it('should forward event creation request to event service', async () => {
        const body = { 
          title: 'Test Event',
          description: 'Description',
          condition: 'Login 3 days',
          startDate: '2025-05-01T00:00:00.000Z',
          endDate: '2025-06-01T00:00:00.000Z',
          isActive: true
        };
        const headers = { Authorization: 'Bearer token' };
        const expectedResult = { 
          id: 'event-123',
          ...body
        };
        
        jest.spyOn(apiGatewayService, 'forwardEventRequest').mockResolvedValue(expectedResult);
        
        const result = await apiGatewayController.createEvent(body, headers);
        
        expect(apiGatewayService.forwardEventRequest).toHaveBeenCalledWith(
          'POST',
          '/events',
          body,
          headers
        );
        expect(result).toEqual(expectedResult);
      });
    });
    
    // Get All Events
    describe('getAllEvents', () => {
      it('should forward get all events request to event service', async () => {
        const headers = { Authorization: 'Bearer token' };
        const expectedResult = [
          { id: '1', title: 'Event 1' },
          { id: '2', title: 'Event 2' }
        ];
        
        jest.spyOn(apiGatewayService, 'forwardEventRequest').mockResolvedValue(expectedResult);
        
        const result = await apiGatewayController.getAllEvents(headers);
        
        expect(apiGatewayService.forwardEventRequest).toHaveBeenCalledWith(
          'GET',
          '/events',
          null,
          headers
        );
        expect(result).toEqual(expectedResult);
      });
      
      it('should return empty array when no events exist', async () => {
        const headers = { Authorization: 'Bearer token' };
        
        jest.spyOn(apiGatewayService, 'forwardEventRequest').mockResolvedValue([]);
        
        const result = await apiGatewayController.getAllEvents(headers);
        
        expect(result).toEqual([]);
      });
    });
    
    // Create Reward
    describe('createReward', () => {
      it('should forward reward creation request to event service', async () => {
        const eventId = 'event-123';
        const body = { 
          name: 'Test Reward',
          description: 'Reward Description',
          type: 'POINT',
          amount: 100
        };
        const headers = { Authorization: 'Bearer token' };
        const expectedResult = { 
          id: 'reward-123',
          eventId,
          ...body
        };
        
        jest.spyOn(apiGatewayService, 'forwardEventRequest').mockResolvedValue(expectedResult);
        
        const result = await apiGatewayController.createReward(eventId, body, headers);
        
        expect(apiGatewayService.forwardEventRequest).toHaveBeenCalledWith(
          'POST',
          `/events/${eventId}/rewards`,
          body,
          headers
        );
        expect(result).toEqual(expectedResult);
      });
    });
    
    // Request Reward
    describe('requestReward', () => {
      it('should forward reward request to event service', async () => {
        const eventId = 'event-123';
        const req = { user: { userId: 'user-123' } };
        const headers = { Authorization: 'Bearer token' };
        const expectedResult = { 
          id: 'request-123',
          eventId,
          userId: 'user-123',
          status: 'PENDING'
        };
        
        jest.spyOn(apiGatewayService, 'forwardEventRequest').mockResolvedValue(expectedResult);
        
        const result = await apiGatewayController.requestReward(eventId, req, headers);
        
        expect(apiGatewayService.forwardEventRequest).toHaveBeenCalledWith(
          'POST',
          `/rewards/request/${eventId}`,
          { userId: 'user-123' },
          headers
        );
        expect(result).toEqual(expectedResult);
      });
    });
  });
});
