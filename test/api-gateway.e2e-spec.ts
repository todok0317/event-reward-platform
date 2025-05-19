import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ApiGatewayModule } from '../apps/api-gateway/src/api-gateway.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '../apps/api-gateway/src/http/http.module';
import { ApiGatewayService } from '../apps/api-gateway/src/api-gateway.service';

describe('ApiGatewayController (e2e)', () => {
  let app: INestApplication;
  let apiGatewayService: ApiGatewayService;

  beforeEach(async () => {
    const mockApiGatewayService = {
      forwardAuthRequest: jest.fn(),
      forwardEventRequest: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        HttpModule,
        ApiGatewayModule,
      ],
    })
    .overrideProvider(ApiGatewayService)
    .useValue(mockApiGatewayService)
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    
    apiGatewayService = app.get<ApiGatewayService>(ApiGatewayService);
    
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Health Endpoints', () => {
    it('/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('service', 'api-gateway');
          expect(res.body).toHaveProperty('timestamp');
        });
    });

    it('/health/auth (GET) - healthy', () => {
      const mockResponse = { status: 'ok', service: 'auth-server' };
      jest.spyOn(apiGatewayService, 'forwardAuthRequest').mockResolvedValue(mockResponse);

      return request(app.getHttpServer())
        .get('/health/auth')
        .expect(200)
        .expect(mockResponse);
    });

    it('/health/event (GET) - healthy', () => {
      const mockResponse = { status: 'ok', service: 'event-server' };
      jest.spyOn(apiGatewayService, 'forwardEventRequest').mockResolvedValue(mockResponse);

      return request(app.getHttpServer())
        .get('/health/event')
        .expect(200)
        .expect(mockResponse);
    });
  });

  describe('Auth Endpoints', () => {
    it('/auth/register (POST)', () => {
      const requestBody = { username: 'test', password: 'password123' };
      const mockResponse = { username: 'test' };
      
      jest.spyOn(apiGatewayService, 'forwardAuthRequest').mockResolvedValue(mockResponse);

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(requestBody)
        .expect(201)
        .expect(mockResponse);
    });

    it('/auth/login (POST)', () => {
      const requestBody = { username: 'test', password: 'password123' };
      const mockResponse = { access_token: 'jwt-token' };
      
      jest.spyOn(apiGatewayService, 'forwardAuthRequest').mockResolvedValue(mockResponse);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(requestBody)
        .expect(201) // Note: For POST requests, NestJS returns 201 by default
        .expect(mockResponse);
    });
  });

  describe('Event Endpoints', () => {
    it('/events (GET) - should return 401 without auth token', () => {
      return request(app.getHttpServer())
        .get('/events')
        .expect(401);
    });

    it('/events (POST) - should return 401 without auth token', () => {
      const requestBody = {
        title: 'Test Event',
        description: 'Event Description',
        condition: 'Login 3 days',
        startDate: '2025-05-15T00:00:00.000Z',
        endDate: '2025-06-15T00:00:00.000Z',
        isActive: true,
      };

      return request(app.getHttpServer())
        .post('/events')
        .send(requestBody)
        .expect(401);
    });
  });

  describe('Invalid Routes', () => {
    it('/non-existent-route (GET) - should return 404', () => {
      return request(app.getHttpServer())
        .get('/non-existent-route')
        .expect(404)
        .expect({
          statusCode: 404,
          message: 'Route not found',
        });
    });
  });
});
