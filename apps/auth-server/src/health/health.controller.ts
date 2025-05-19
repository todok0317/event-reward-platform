import { Controller, Get } from '@nestjs/common';

/**
 * Auth Server 상태 확인 컨트롤러
 */
@Controller('health')
export class HealthController {
  /**
   * Auth Server 상태 확인
   * @returns Auth Server 상태 정보
   */
  @Get()
  checkHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'auth-server',
    };
  }
}
