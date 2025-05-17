import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * 사용자 생성 DTO
 */
export class CreateUserDto {
  /**
   * 사용자명
   * 필수 입력값
   */
  @IsNotEmpty()
  @IsString()
  username: string;

  /**
   * 비밀번호
   * 필수 입력값
   * 최소 6자 이상
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

/**
 * 로그인 DTO
 */
export class LoginUserDto {
  /**
   * 사용자명
   * 필수 입력값
   */
  @IsNotEmpty()
  @IsString()
  username: string;

  /**
   * 비밀번호
   * 필수 입력값
   */
  @IsNotEmpty()
  @IsString()
  password: string;
}

/**
 * 역할 할당 DTO
 */
export class AssignRoleDto {
  /**
   * 역할명
   * USER, OPERATOR, AUDITOR, ADMIN 중 하나
   */
  @IsNotEmpty()
  @IsString()
  role: string;
}
