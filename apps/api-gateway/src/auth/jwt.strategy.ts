import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * JWT 인증 전략 클래스
 * PassportStrategy를 상속받아 JWT 토큰 검증 로직 구현
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Bearer 토큰에서 JWT 추출
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 만료된 토큰 거부
      ignoreExpiration: false,
      // JWT 시크릿 키 설정
      secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
    });
  }

  /**
   * JWT 페이로드 검증 및 사용자 정보 추출
   * @param payload JWT 페이로드
   * @returns 사용자 정보 객체
   */
  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username, roles: payload.roles };
  }
}
