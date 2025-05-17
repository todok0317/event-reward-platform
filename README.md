# 이벤트/보상 관리 플랫폼

메이플스토리 PC 백엔드 엔지니어 과제로 구현한 이벤트/보상 관리 플랫폼입니다.

## 프로젝트 구조

본 프로젝트는 마이크로서비스 아키텍처로 구성되어 있으며, 다음과 같은 세 개의 서비스로 이루어져 있습니다:

1. **API Gateway** (포트: 3000)
   - 모든 API 요청의 진입점
   - 인증 및 권한 관리
   - 요청 라우팅

2. **Auth Server** (포트: 3001)
   - 유저 관리 (등록, 로그인)
   - 역할(Role) 관리
   - JWT 토큰 발급

3. **Event Server** (포트: 3002)
   - 이벤트 등록/관리
   - 보상 정의
   - 보상 요청 처리

## 기술 스택

- **Node.js**: 18.x
- **NestJS**: 최신 버전
- **MongoDB**: 최신 버전
- **TypeScript**: 최신 버전
- **Docker & Docker Compose**: 컨테이너화 및 배포

## 설치 및 실행 방법

### 사전 준비사항

- Docker 및 Docker Compose가 설치되어 있어야 합니다.
- Node.js 18 이상이 설치되어 있어야 합니다.

### 로컬 개발 환경 설정

1. 프로젝트 클론:

```bash
git clone <repository-url>
cd event-reward-platform
```

2. 종속성 설치:

```bash
npm install
```

3. 로컬에서 서비스 개별 실행 (개발 모드):

```bash
# API Gateway 실행
npm run start:api-gateway:dev

# Auth Server 실행
npm run start:auth-server:dev

# Event Server 실행
npm run start:event-server:dev
```

### Docker Compose를 이용한 실행

1. Docker 이미지 빌드:

```bash
npm run docker:build
```

2. 모든 서비스 시작:

```bash
npm run docker:up
```

3. 서비스 중지:

```bash
npm run docker:down
```

## API 문서

### Auth Server API

#### 사용자 등록
- **POST** `/auth/register`
- **Body**: 
```json
{
  "username": "string",
  "password": "string"
}
```

#### 로그인
- **POST** `/auth/login`
- **Body**: 
```json
{
  "username": "string",
  "password": "string"
}
```
- **Response**: JWT 토큰 반환

#### 역할 할당
- **POST** `/auth/users/:userId/role`
- **Body**: 
```json
{
  "role": "USER | OPERATOR | AUDITOR | ADMIN"
}
```
- **Authorization**: Bearer 토큰 필요 (ADMIN 역할)

### Event Server API

#### 이벤트 생성
- **POST** `/events`
- **Body**: 
```json
{
  "title": "string",
  "description": "string",
  "condition": "string",
  "startDate": "ISO String",
  "endDate": "ISO String",
  "isActive": boolean
}
```
- **Authorization**: Bearer 토큰 필요 (OPERATOR 또는 ADMIN 역할)

#### 이벤트 목록 조회
- **GET** `/events`
- **Authorization**: Bearer 토큰 필요

#### 이벤트 상세 조회
- **GET** `/events/:id`
- **Authorization**: Bearer 토큰 필요

#### 이벤트 수정
- **PUT** `/events/:id`
- **Body**: 
```json
{
  "title": "string",
  "description": "string",
  "condition": "string",
  "startDate": "ISO String",
  "endDate": "ISO String",
  "isActive": boolean
}
```
- **Authorization**: Bearer 토큰 필요 (OPERATOR 또는 ADMIN 역할)

#### 보상 생성
- **POST** `/events/:eventId/rewards`
- **Body**: 
```json
{
  "name": "string",
  "description": "string",
  "type": "POINT | ITEM | COUPON",
  "amount": number
}
```
- **Authorization**: Bearer 토큰 필요 (OPERATOR 또는 ADMIN 역할)

#### 보상 목록 조회
- **GET** `/events/:eventId/rewards`
- **Authorization**: Bearer 토큰 필요

#### 보상 요청
- **POST** `/rewards/request/:eventId`
- **Authorization**: Bearer 토큰 필요 (USER 역할)

#### 유저별 보상 요청 조회
- **GET** `/rewards/request/user`
- **Authorization**: Bearer 토큰 필요

#### 모든 보상 요청 조회 (관리자용)
- **GET** `/rewards/request`
- **Query Parameters**:
  - `status`: 요청 상태 필터링 (PENDING | APPROVED | REJECTED)
  - `eventId`: 이벤트별 필터링
- **Authorization**: Bearer 토큰 필요 (OPERATOR, AUDITOR 또는 ADMIN 역할)

## 역할(Role) 설명

- **USER**: 일반 사용자, 이벤트 보상 요청 가능
- **OPERATOR**: 이벤트 및 보상 등록/관리 가능
- **AUDITOR**: 보상 이력 조회만 가능
- **ADMIN**: 모든 기능 접근 가능

## 설계 의도 및 고려사항

### 마이크로서비스 구조 선택 이유
- 서비스 간 책임 분리로 유지보수 및 확장성 향상
- 각 서비스가 독립적으로 동작하여 장애 격리
- 필요에 따라 서비스별 스케일링 가능

### API Gateway 패턴 활용
- 단일 진입점으로 API 관리 및 라우팅 간소화
- 인증 및 권한 검사 중앙화
- 횡단 관심사(cross-cutting concerns) 처리

### 데이터 모델 설계
- 이벤트와 보상의 명확한 분리
- 보상 요청 상태 관리를 위한 별도 모델
- MongoDB의 유연한 스키마 활용

### 보안 고려사항
- JWT 기반 인증으로 안전한 API 접근
- 역할 기반 권한 부여로 기능 접근 제한
- 비밀번호 해싱으로 안전한 인증

## 추가 개선 가능성

- API 엔드포인트 문서화 (Swagger 통합)
- 단위 테스트 및 통합 테스트 추가
- 로깅 및 모니터링 솔루션 통합
- 캐싱 메커니즘 도입
