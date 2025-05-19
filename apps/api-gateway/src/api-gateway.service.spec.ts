import { Test, TestingModule } from '@nestjs/testing';
import { ApiGatewayService } from './api-gateway.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from './http/http.service';

describe('ApiGatewayService', () => {
  let service: ApiGatewayService;
  let httpService: HttpService;

  beforeEach(async () => {
    const mockHttpService = {
      request: jest.fn(),
    };
    
    const mockConfigService = {
      get: jest.fn((key, defaultValue) => {
        if (key === 'AUTH_SERVICE_HOST') return 'localhost';
        if (key === 'AUTH_SERVICE_PORT') return '3001';
        if (key === 'EVENT_SERVICE_HOST') return 'localhost';
        if (key === 'EVENT_SERVICE_PORT') return '3002';
        return defaultValue;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiGatewayService,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<ApiGatewayService>(ApiGatewayService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('forwardAuthRequest', () => {
    it('should forward request to auth service', async () => {
      const mockResponse = { data: { username: 'test' } };
      jest.spyOn(httpService, 'request').mockResolvedValue(mockResponse);

      const result = await service.forwardAuthRequest('POST', '/auth/register', { username: 'test', password: 'test' });

      expect(httpService.request).toHaveBeenCalledWith({
        method: 'POST',
        url: 'http://localhost:3001/auth/register',
        data: { username: 'test', password: 'test' },
        headers: {},
      });
      expect(result).toEqual({ username: 'test' });
    });
  });

  describe('forwardEventRequest', () => {
    it('should forward request to event service', async () => {
      const mockResponse = { data: [{ id: '1', title: 'Event 1' }] };
      jest.spyOn(httpService, 'request').mockResolvedValue(mockResponse);

      const result = await service.forwardEventRequest('GET', '/events', null, { Authorization: 'Bearer token' });

      expect(httpService.request).toHaveBeenCalledWith({
        method: 'GET',
        url: 'http://localhost:3002/events',
        data: null,
        headers: { Authorization: 'Bearer token' },
      });
      expect(result).toEqual([{ id: '1', title: 'Event 1' }]);
    });
  });
});
