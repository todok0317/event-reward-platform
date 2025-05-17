import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * HTTP 요청을 처리하는 서비스
 * 재시도 로직이 포함된 HTTP 클라이언트 제공
 */
@Injectable()
export class HttpService {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      // 기본 설정
      timeout: 10000, // 10초 타임아웃
      headers: {
        'Content-Type': 'application/json',
      },
      // credential 및 CORS 설정
      withCredentials: false,
    });
  }

  /**
   * 재시도 로직이 포함된 HTTP 요청 메서드
   * @param config Axios 요청 설정
   * @param retries 최대 재시도 횟수 (기본값: 3)
   * @param delay 재시도 간격 (밀리초, 기본값: 1000)
   * @returns 응답 객체
   */
  async requestWithRetry<T = any>(config: AxiosRequestConfig, retries = 3, delay = 1000): Promise<AxiosResponse<T>> {
    // 요청 로깅
    console.log(`HTTP 요청 실행: ${config.method} ${config.url}`);
    if (config.headers) {
      // Authorization 헤더는 가려서 로깅
      const loggableHeaders = { ...config.headers };
      if (loggableHeaders.Authorization) {
        loggableHeaders.Authorization = 'Bearer ***';
      }
      console.log('요청 헤더:', loggableHeaders);
    }
    
    let lastError;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await this.axiosInstance.request<T>({
          ...config,
          maxRedirects: 5,
          validateStatus: (status) => status < 500, // 500 이상의 상태 코드만 오류로 처리
        });
        
        // 응답 로깅
        console.log(`${config.url}에서 응답 수신, 상태: ${response.status}`);
        return response;
      } catch (error) {
        lastError = error;
        
        // 연결 거부 오류인 경우 재시도
        if (error.code === 'ECONNREFUSED' && attempt < retries - 1) {
          console.log(`${config.url}에 연결 거부됨, ${delay}ms 후 재시도... (시도 ${attempt + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // 오류 로깅
        console.error(`${config.url}에 요청 중 오류 발생:`, error.message);
        if (error.isAxiosError) {
          console.error('Axios 오류 상세 정보:', {
            request: error.request ? '요청이 이루어짐' : '요청이 이루어지지 않음',
            response: error.response ? {
              status: error.response.status,
              statusText: error.response.statusText,
              data: error.response.data
            } : '응답 수신되지 않음',
            config: error.config
          });
        }
        throw error;
      }
    }
    
    throw lastError;
  }

  /**
   * HTTP 요청 메서드
   * @param config Axios 요청 설정
   * @returns 응답 객체
   */
  request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.requestWithRetry<T>(config);
  }

  /**
   * GET 요청 메서드
   * @param url 요청 URL
   * @param config 추가 요청 설정 (선택적)
   * @returns 응답 객체
   */
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.requestWithRetry<T>({ ...config, method: 'get', url });
  }

  /**
   * POST 요청 메서드
   * @param url 요청 URL
   * @param data 전송할 데이터 (선택적)
   * @param config 추가 요청 설정 (선택적)
   * @returns 응답 객체
   */
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.requestWithRetry<T>({ ...config, method: 'post', url, data });
  }

  /**
   * PUT 요청 메서드
   * @param url 요청 URL
   * @param data 전송할 데이터 (선택적)
   * @param config 추가 요청 설정 (선택적)
   * @returns 응답 객체
   */
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.requestWithRetry<T>({ ...config, method: 'put', url, data });
  }

  /**
   * DELETE 요청 메서드
   * @param url 요청 URL
   * @param config 추가 요청 설정 (선택적)
   * @returns 응답 객체
   */
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.requestWithRetry<T>({ ...config, method: 'delete', url });
  }

  /**
   * PATCH 요청 메서드
   * @param url 요청 URL
   * @param data 전송할 데이터 (선택적)
   * @param config 추가 요청 설정 (선택적)
   * @returns 응답 객체
   */
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.requestWithRetry<T>({ ...config, method: 'patch', url, data });
  }
}
