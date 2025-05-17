import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * 역할 기반 접근 제어 가드
 * 라우트 핸들러에 접근하기 위한 사용자 역할 검사
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * 요청한 사용자가 필요한 역할을 가지고 있는지 검사
   * @param context 실행 컨텍스트
   * @returns 접근 허용 여부 (true/false)
   */
  canActivate(context: ExecutionContext): boolean {
    // 라우트 핸들러나 컨트롤러에 설정된 필요 역할 가져오기
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    // 필요 역할이 없으면 접근 허용
    if (!requiredRoles) {
      return true;
    }
    
    // 요청에서 사용자 정보 가져오기
    const { user } = context.switchToHttp().getRequest();
    
    // 사용자가 필요한 역할 중 하나 이상을 가지고 있는지 확인
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
