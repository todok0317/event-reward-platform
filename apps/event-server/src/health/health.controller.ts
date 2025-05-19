import { Controller, Get } from '@nestjs/common';

/**
 * Event Server 상태 확인 컨트롤러
 */
@Controller('health')
export class HealthController {
  /**
   * Event Server 상태 확인
   * @returns Event Server 상태 정보
   */
  @Get()
  checkHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'event-server',
    };
  }
}
