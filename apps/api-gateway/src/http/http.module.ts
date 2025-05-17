import { Module, Global } from '@nestjs/common';
import { HttpService } from './http.service';

/**
 * HTTP 모듈
 * HTTP 요청 처리를 위한 서비스 제공
 * Global 데코레이터를 사용하여 전역 모듈로 등록
 */
@Global()
@Module({
  providers: [HttpService],
  exports: [HttpService],
})
export class HttpModule {}
