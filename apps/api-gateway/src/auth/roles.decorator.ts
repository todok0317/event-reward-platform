import { SetMetadata } from '@nestjs/common';

/**
 * 역할 지정 데코레이터
 * 라우트 핸들러에 필요한 역할을 지정하는데 사용
 * 
 * @param roles 필요한 역할 목록
 * @returns 메타데이터 데코레이터
 * 
 * 사용 예시:
 * @Roles('ADMIN', 'OPERATOR')
 * @Get('admin-only-route')
 * adminOnlyRoute() { ... }
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
