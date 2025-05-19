import { Controller, Get } from '@nestjs/common';
import { ApiGatewayService } from '../api-gateway.service';

/**
 * 서비스 상태 확인 컨트롤러
 * 각 서비스의 상태를 모니터링하는 엔드포인트 제공
 */
@Controller('health')
export class HealthController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  /**
   * API Gateway 상태 확인
   * @returns API Gateway 상태 정보
   */
  @Get()
  checkHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
    };
  }

  /**
   * Auth Server 상태 확인
   * @returns Auth Server 상태 정보
   */
  @Get('auth')
  async checkAuthHealth() {
    try {
      const response = await this.apiGatewayService.forwardAuthRequest('GET', '/health');
      return response;
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'auth-server',
        error: error.message,
      };
    }
  }

  /**
   * Event Server 상태 확인
   * @returns Event Server 상태 정보
   */
  @Get('event')
  async checkEventHealth() {
    try {
      const response = await this.apiGatewayService.forwardEventRequest('GET', '/health');
      return response;
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'event-server',
        error: error.message,
      };
    }
  }
}
