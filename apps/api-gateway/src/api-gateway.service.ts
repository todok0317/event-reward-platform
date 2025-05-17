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
    const authHost = this.configService.get('AUTH_SERVICE_HOST', 'localhost');
    const authPort = this.configService.get('AUTH_SERVICE_PORT', '3001');
    this.authServiceUrl = `http://${authHost}:${authPort}`;

    const eventHost = this.configService.get('EVENT_SERVICE_HOST', 'localhost');
    const eventPort = this.configService.get('EVENT_SERVICE_PORT', '3002');
    this.eventServiceUrl = `http://${eventHost}:${eventPort}`;
  }

  async forwardAuthRequest(method: string, path: string, body?: any, headers?: any) {
    try {
      const url = `${this.authServiceUrl}${path}`;
      const response = await this.httpService.request({
        method,
        url,
        data: body,
        headers: headers || {},
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException('Auth Service Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async forwardEventRequest(method: string, path: string, body?: any, headers?: any) {
    try {
      const url = `${this.eventServiceUrl}${path}`;
      const response = await this.httpService.request({
        method,
        url,
        data: body,
        headers: headers || {},
      });
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw new HttpException('Event Service Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
