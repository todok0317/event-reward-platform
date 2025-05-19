import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { ApiGatewayService } from '../api-gateway.service';

describe('HealthController', () => {
  let controller: HealthController;
  let apiGatewayService: ApiGatewayService;

  beforeEach(async () => {
    const mockApiGatewayService = {
      forwardAuthRequest: jest.fn(),
      forwardEventRequest: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: ApiGatewayService,
          useValue: mockApiGatewayService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    apiGatewayService = module.get<ApiGatewayService>(ApiGatewayService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return health status of API Gateway', () => {
      const result = controller.checkHealth();
      
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('service', 'api-gateway');
    });
  });

  describe('checkAuthHealth', () => {
    it('should return health status of Auth Server when it is healthy', async () => {
      const mockResponse = { status: 'ok', service: 'auth-server' };
      jest.spyOn(apiGatewayService, 'forwardAuthRequest').mockResolvedValue(mockResponse);

      const result = await controller.checkAuthHealth();
      
      expect(apiGatewayService.forwardAuthRequest).toHaveBeenCalledWith('GET', '/health');
      expect(result).toEqual(mockResponse);
    });

    it('should return error status when Auth Server is unhealthy', async () => {
      jest.spyOn(apiGatewayService, 'forwardAuthRequest').mockRejectedValue(new Error('Connection failed'));

      const result = await controller.checkAuthHealth();
      
      expect(result).toHaveProperty('status', 'error');
      expect(result).toHaveProperty('service', 'auth-server');
      expect(result).toHaveProperty('error', 'Connection failed');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('checkEventHealth', () => {
    it('should return health status of Event Server when it is healthy', async () => {
      const mockResponse = { status: 'ok', service: 'event-server' };
      jest.spyOn(apiGatewayService, 'forwardEventRequest').mockResolvedValue(mockResponse);

      const result = await controller.checkEventHealth();
      
      expect(apiGatewayService.forwardEventRequest).toHaveBeenCalledWith('GET', '/health');
      expect(result).toEqual(mockResponse);
    });

    it('should return error status when Event Server is unhealthy', async () => {
      jest.spyOn(apiGatewayService, 'forwardEventRequest').mockRejectedValue(new Error('Connection failed'));

      const result = await controller.checkEventHealth();
      
      expect(result).toHaveProperty('status', 'error');
      expect(result).toHaveProperty('service', 'event-server');
      expect(result).toHaveProperty('error', 'Connection failed');
      expect(result).toHaveProperty('timestamp');
    });
  });
});
