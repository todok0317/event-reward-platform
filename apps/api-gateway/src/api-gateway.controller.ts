import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards, Headers, Req, HttpCode, HttpStatus, All } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';

@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  // Auth routes
  @Post('auth/register')
  register(@Body() body: any) {
    return this.apiGatewayService.forwardAuthRequest('POST', '/auth/register', body);
  }

  @Post('auth/login')
  login(@Body() body: any) {
    return this.apiGatewayService.forwardAuthRequest('POST', '/auth/login', body);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  @Post('auth/users/:userId/role')
  assignRole(@Param('userId') userId: string, @Body() body: any) {
    return this.apiGatewayService.forwardAuthRequest('POST', `/auth/users/${userId}/role`, body);
  }

  // Event routes
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OPERATOR', 'ADMIN')
  @Post('events')
  createEvent(@Body() body: any, @Headers() headers: any) {
    return this.apiGatewayService.forwardEventRequest('POST', '/events', body, headers);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('events')
  getAllEvents(@Headers() headers: any) {
    return this.apiGatewayService.forwardEventRequest('GET', '/events', null, headers);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('events/:id')
  getEventById(@Param('id') id: string, @Headers() headers: any) {
    return this.apiGatewayService.forwardEventRequest('GET', `/events/${id}`, null, headers);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OPERATOR', 'ADMIN')
  @Put('events/:id')
  updateEvent(@Param('id') id: string, @Body() body: any, @Headers() headers: any) {
    return this.apiGatewayService.forwardEventRequest('PUT', `/events/${id}`, body, headers);
  }

  // Reward routes
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OPERATOR', 'ADMIN')
  @Post('events/:eventId/rewards')
  createReward(@Param('eventId') eventId: string, @Body() body: any, @Headers() headers: any) {
    return this.apiGatewayService.forwardEventRequest('POST', `/events/${eventId}/rewards`, body, headers);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('events/:eventId/rewards')
  getRewards(@Param('eventId') eventId: string, @Headers() headers: any) {
    return this.apiGatewayService.forwardEventRequest('GET', `/events/${eventId}/rewards`, null, headers);
  }

  // User reward request routes
  @UseGuards(AuthGuard('jwt'))
  @Post('rewards/request/:eventId')
  requestReward(@Param('eventId') eventId: string, @Req() req: any, @Headers() headers: any) {
    const body = { userId: req.user.userId };
    return this.apiGatewayService.forwardEventRequest('POST', `/rewards/request/${eventId}`, body, headers);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('rewards/request/user')
  getUserRewardRequests(@Req() req: any, @Headers() headers: any) {
    return this.apiGatewayService.forwardEventRequest('GET', `/rewards/request/user/${req.user.userId}`, null, headers);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('OPERATOR', 'AUDITOR', 'ADMIN')
  @Get('rewards/request')
  getAllRewardRequests(@Query() query: any, @Headers() headers: any) {
    return this.apiGatewayService.forwardEventRequest('GET', '/rewards/request', null, {
      ...headers,
      params: query,
    });
  }

  // Catch all other routes
  @All('*')
  notFound() {
    return {
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Route not found',
    };
  }
}
