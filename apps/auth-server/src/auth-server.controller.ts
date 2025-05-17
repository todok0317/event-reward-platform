import { Controller, Post, Body, Get, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthServerService } from './auth-server.service';
import { CreateUserDto, LoginUserDto, AssignRoleDto } from './dto/user.dto';

/**
 * Auth Server 컨트롤러
 * 사용자 인증 및 권한 관리 API 제공
 */
@Controller('auth')
export class AuthServerController {
  constructor(private readonly authServerService: AuthServerService) {}

  /**
   * 사용자 등록 API
   * @param createUserDto 사용자 생성 DTO
   * @returns 생성된 사용자 정보 (비밀번호 제외)
   */
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authServerService.register(createUserDto);
  }

  /**
   * 로그인 API
   * 성공 시 JWT 토큰 반환
   * @param loginUserDto 로그인 DTO
   * @returns JWT 토큰
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authServerService.login(loginUserDto);
  }

  /**
   * 사용자에게 역할 할당 API
   * @param userId 사용자 ID
   * @param assignRoleDto 역할 할당 DTO
   * @returns 업데이트된 사용자 정보
   */
  @Post('users/:userId/role')
  assignRole(
    @Param('userId') userId: string,
    @Body() assignRoleDto: AssignRoleDto,
  ) {
    return this.authServerService.assignRole(userId, assignRoleDto);
  }

  /**
   * 모든 사용자 목록 조회 API
   * @returns 사용자 목록
   */
  @Get('users')
  findAll() {
    return this.authServerService.findAll();
  }

  /**
   * 특정 사용자 정보 조회 API
   * @param id 사용자 ID
   * @returns 사용자 정보
   */
  @Get('users/:id')
  findOne(@Param('id') id: string) {
    return this.authServerService.findById(id);
  }
}
