import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from './http/http.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiGatewayService {
  private authServiceUrl: string;
  private eventServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // 환경 변수에서 Auth 서비스의 주소와 포트를 가져옴
    const authHost = this.configService.get('AUTH_SERVICE_HOST', 'localhost');
    const authPort = this.configService.get('AUTH_SERVICE_PORT', '3001');
    this.authServiceUrl = `http://${authHost}:${authPort}`;

    // 환경 변수에서 Event 서비스의 주소와 포트를 가져옴
    const eventHost = this.configService.get('EVENT_SERVICE_HOST', 'localhost');
    const eventPort = this.configService.get('EVENT_SERVICE_PORT', '3002');
    this.eventServiceUrl = `http://${eventHost}:${eventPort}`;
    
    console.log(`Auth Service URL: ${this.authServiceUrl}`);
    console.log(`Event Service URL: ${this.eventServiceUrl}`);
  }

  /**
   * Auth 서비스로 요청을 전달합니다.
   * @param method HTTP 메서드 (GET, POST, PUT, DELETE 등)
   * @param path 요청 경로
   * @param body 요청 본문 데이터 (선택적)
   * @param headers 요청 헤더 (선택적)
   * @returns Auth 서비스의 응답
   */
  async forwardAuthRequest(method: string, path: string, body?: any, headers?: any) {
    try {
      const url = `${this.authServiceUrl}${path}`;
      console.log(`Auth 서비스로 요청 전달: ${method} ${url}`, body);
      
      const response = await this.httpService.request({
        method,
        url,
        data: body,
        headers: headers || {},
      });
      
      console.log(`Auth 서비스로부터 응답 수신:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Auth 서비스로 요청 전달 중 오류 발생:', error);
      
      if (error.response) {
        console.error('오류 응답 데이터:', error.response.data);
        console.error('오류 응답 상태:', error.response.status);
        throw new HttpException(error.response.data, error.response.status);
      }
      
      throw new HttpException(
        `Auth 서비스 오류: ${error.message || '알 수 없는 오류'}`, 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Event 서비스로 요청을 전달합니다.
   * @param method HTTP 메서드 (GET, POST, PUT, DELETE 등)
   * @param path 요청 경로
   * @param body 요청 본문 데이터 (선택적)
   * @param headers 요청 헤더 (선택적)
   * @returns Event 서비스의 응답
   */
  async forwardEventRequest(method: string, path: string, body?: any, headers?: any) {
    try {
      const url = `${this.eventServiceUrl}${path}`;
      console.log(`Event 서비스로 요청 전달: ${method} ${url}`, body);
      
      const response = await this.httpService.request({
        method,
        url,
        data: body,
        headers: headers || {},
      });
      
      console.log(`Event 서비스로부터 응답 수신:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Event 서비스로 요청 전달 중 오류 발생:', error);
      
      if (error.response) {
        console.error('오류 응답 데이터:', error.response.data);
        console.error('오류 응답 상태:', error.response.status);
        throw new HttpException(error.response.data, error.response.status);
      }
      
      throw new HttpException(
        `Event 서비스 오류: ${error.message || '알 수 없는 오류'}`, 
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
