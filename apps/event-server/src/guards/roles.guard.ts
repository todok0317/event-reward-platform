import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    
    // 사용자 역할이 배열인지 확인
    const roles = Array.isArray(user.roles) ? user.roles : [user.roles];
    
    // 요구되는 역할 중 하나라도 있는지 확인
    const hasRole = requiredRoles.some(role => roles.includes(role));
    
    if (!hasRole) {
      throw new ForbiddenException('이 작업을 수행할 권한이 없습니다');
    }
    
    return true;
  }
}
