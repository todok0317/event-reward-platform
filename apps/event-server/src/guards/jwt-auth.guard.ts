import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('인증 토큰이 필요합니다');
    }

    try {
      const secret = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
      const payload = jwt.verify(token, secret);
      // 요청 객체에 사용자 정보 추가
      request.user = payload;
      return true;
    } catch (e) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
