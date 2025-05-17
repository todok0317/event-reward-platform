import { IsNotEmpty, IsString, IsBoolean, IsOptional, IsDateString } from 'class-validator';

/**
 * 이벤트 생성 DTO
 */
export class CreateEventDto {
  /**
   * 이벤트 제목
   * 필수 입력값
   */
  @IsNotEmpty()
  @IsString()
  title: string;

  /**
   * 이벤트 설명
   * 선택적 입력값
   */
  @IsString()
  @IsOptional()
  description?: string;

  /**
   * 이벤트 조건
   * 필수 입력값
   */
  @IsNotEmpty()
  @IsString()
  condition: string;

  /**
   * 이벤트 시작일
   * ISO 형식의 날짜 문자열
   * 필수 입력값
   */
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  /**
   * 이벤트 종료일
   * ISO 형식의 날짜 문자열
   * 필수 입력값
   */
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  /**
   * 이벤트 활성화 여부
   * 선택적 입력값
   */
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

/**
 * 이벤트 업데이트 DTO
 */
export class UpdateEventDto {
  /**
   * 이벤트 제목
   * 선택적 입력값
   */
  @IsString()
  @IsOptional()
  title?: string;

  /**
   * 이벤트 설명
   * 선택적 입력값
   */
  @IsString()
  @IsOptional()
  description?: string;

  /**
   * 이벤트 조건
   * 선택적 입력값
   */
  @IsString()
  @IsOptional()
  condition?: string;

  /**
   * 이벤트 시작일
   * ISO 형식의 날짜 문자열
   * 선택적 입력값
   */
  @IsDateString()
  @IsOptional()
  startDate?: string;

  /**
   * 이벤트 종료일
   * ISO 형식의 날짜 문자열
   * 선택적 입력값
   */
  @IsDateString()
  @IsOptional()
  endDate?: string;

  /**
   * 이벤트 활성화 여부
   * 선택적 입력값
   */
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
