import { Controller, Post, Body, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthServerService } from './auth-server.service';
import { CreateUserDto, LoginUserDto, AssignRoleDto } from './dto/user.dto';

@Controller('auth')
export class AuthServerController {
  constructor(private readonly authServerService: AuthServerService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authServerService.register(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authServerService.login(loginUserDto);
  }

  @Post('users/:userId/role')
  assignRole(
    @Param('userId') userId: string,
    @Body() assignRoleDto: AssignRoleDto,
  ) {
    return this.authServerService.assignRole(userId, assignRoleDto);
  }

  @Get('users')
  findAll() {
    return this.authServerService.findAll();
  }

  @Get('users/:id')
  findOne(@Param('id') id: string) {
    return this.authServerService.findById(id);
  }
}
