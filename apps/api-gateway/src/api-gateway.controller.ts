import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards, Headers, Req, HttpCode, HttpStatus, All } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';

@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  // Auth 관련 라우트
  /**
   * 사용자 등록 API
   * @param body 사용자 등록 정보 (username, password)
   * @returns 등록된 사용자 정보
   */
  @Post('auth/register')
  register(@Body() body: any) {
    return this.apiGatewayService.forwardAuthRequest('POST', '/auth/register', body);
  }

  /**
   * 로그인 API
   * @param body 로그인 정보 (username, password)
   * @returns JWT 토큰
   */
  @Post('auth/login')
  login(@Body() body: any) {
    return this.apiGatewayService.forwardAuthRequest('POST', '/auth/login', body);
  }

  /**
   * 사용자에게 역할 할당 API (ADMIN 전용)
   * @param userId 사용자 ID
   * @param body 역할 정보 (role)
   * @param headers 요청 헤더 (인증 토큰 포함)
   * @returns 업데이트된 사용자 정보
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post('auth/users/:userId/role')
  assignRole(@Param('userId') userId: string, @Body() body: any, @Headers() headers: any) {
    return this.apiGatewayService.forwardAuthRequest('POST', `/auth/users/${userId}/role`, body, headers);
  }

  /**
   * 사용자 목록 조회 API
   * @param headers 요청 헤더 (인증 토큰 포함)
   * @returns 사용자 목록
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('auth/users')
  getUsers(@Headers() headers: any) {
    return this.apiGatewayService.forwardAuthRequest('GET', '/auth/users', null, headers);
  }

  /**
   * 사용자 상세 조회 API
   * @param id 사용자 ID
   * @param headers 요청 헤더 (인증 토큰 포함)
   * @returns 사용자 정보
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('auth/users/:id')
  getUserById(@Param('id') id: string, @Headers() headers: any) {
    return this.apiGatewayService.forwardAuthRequest('GET', `/auth/users/${id}`, null, headers);
  }

  // Event 관련 라우트
  /**
   * 이벤트 생성 API (OPERATOR 또는 ADMIN 전용)
   * @param body 이벤트 정보
   * @param headers 요청 헤더 (인증 토큰 포함)
   * @returns 생성된 이벤트 정보
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OPERATOR', 'ADMIN')
  @Post('events')
  createEvent(@Body() body: any, @Headers() headers: any) {
    return this.apiGatewayService.forwardEventRequest('POST', '/events', body, headers);
  }

  /**
   * 이벤트 목록 조회 API
   * @param headers 요청 헤더 (인증 토큰 포함)
   * @returns 이벤트 목록
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('events')
  getAllEvents(@Headers() headers: any) {
    return this.apiGatewayService.forwardEventRequest('GET', '/events', null, headers);
  }

  /**
   * 이벤트 상세 조회 API
   * @param id 이벤트 ID
   * @param headers 요청 헤더 (인증 토큰 포함)
   * @returns 이벤트 정보
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('events/:id')
  getEventById(@Param('id') id: string, @Headers() headers: any) {
    return this.apiGatewayService.forwardEventRequest('GET', `/events/${id}`, null, headers);
  }

  /**
   * 이벤트 업데이트 API (OPERATOR 또는 ADMIN 전용)
   * @param id 이벤트 ID
   * @param body 업데이트할 이벤트 정보
   * @param headers 요청 헤더 (인증 토큰 포함)
   * @returns 업데이트된 이벤트 정보
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OPERATOR', 'ADMIN')
  @Put('events/:id')
  updateEvent(@Param('id') id: string, @Body() body: any, @Headers() headers: any) {
    return this.apiGatewayService.forwardEventRequest('PUT', `/events/${id}`, body, headers);
  }

  // Reward 관련 라우트
  /**
   * 보상 생성 API (OPERATOR 또는 ADMIN 전용)
   * @param eventId 이벤트 ID
   * @param body 보상 정보
   * @param headers 요청 헤더 (인증 토큰 포함)
   * @returns 생성된 보상 정보
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OPERATOR', 'ADMIN')
  @Post('events/:eventId/rewards')
  createReward(@Param('eventId') eventId: string, @Body() body: any, @Headers() headers: any) {
    return this.apiGatewayService.forwardEventRequest('POST', `/events/${eventId}/rewards`, body, headers);
  }

  /**
   * 보상 목록 조회 API
   * @param eventId 이벤트 ID
   * @param headers 요청 헤더 (인증 토큰 포함)
   * @returns 보상 목록
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('events/:eventId/rewards')
  getRewards(@Param('eventId') eventId: string, @Headers() headers: any) {
    return this.apiGatewayService.forwardEventRequest('GET', `/events/${eventId}/rewards`, null, headers);
  }

  // 사용자 보상 요청 관련 라우트
  /**
   * 보상 요청 API
   * @param eventId 이벤트 ID
   * @param req 요청 객체 (사용자 정보 포함)
   * @param headers 요청 헤더 (인증 토큰 포함)
   * @returns 생성된 보상 요청 정보
   */
  @UseGuards(AuthGuard('jwt'))
  @Post('rewards/request/:eventId')
  requestReward(@Param('eventId') eventId: string, @Req() req: any, @Headers() headers: any) {
    const body = { userId: req.user.userId };
    return this.apiGatewayService.forwardEventRequest('POST', `/rewards/request/${eventId}`, body, headers);
  }

  /**
   * 사용자 보상 요청 목록 조회 API
   * @param req 요청 객체 (사용자 정보 포함)
   * @param headers 요청 헤더 (인증 토큰 포함)
   * @returns 사용자의 보상 요청 목록
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('rewards/request/user')
  getUserRewardRequests(@Req() req: any, @Headers() headers: any) {
    return this.apiGatewayService.forwardEventRequest('GET', `/rewards/request/user/${req.user.userId}`, null, headers);
  }

  /**
   * 전체 보상 요청 목록 조회 API (관리자용)
   * @param query 쿼리 파라미터 (필터링 옵션)
   * @param headers 요청 헤더 (인증 토큰 포함)
   * @returns 전체 보상 요청 목록
   */
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OPERATOR', 'AUDITOR', 'ADMIN')
  @Get('rewards/request')
  getAllRewardRequests(@Query() query: any, @Headers() headers: any) {
    return this.apiGatewayService.forwardEventRequest('GET', '/rewards/request', null, {
      ...headers,
      params: query,
    });
  }

  /**
   * 존재하지 않는 라우트에 대한 처리
   * @returns 404 Not Found 응답
   */
  @All('*')
  notFound() {
    return {
      statusCode: HttpStatus.NOT_FOUND,
      message: '라우트를 찾을 수 없습니다',
    };
  }
}
