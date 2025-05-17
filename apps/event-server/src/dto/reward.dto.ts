import { IsNotEmpty, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { RewardType } from '../models/reward.schema';

/**
 * 보상 생성 DTO
 */
export class CreateRewardDto {
  /**
   * 보상 이름
   * 필수 입력값
   */
  @IsNotEmpty()
  @IsString()
  name: string;

  /**
   * 보상 설명
   * 필수 입력값
   */
  @IsNotEmpty()
  @IsString()
  description: string;

  /**
   * 보상 유형
   * POINT, ITEM, COUPON 중 하나
   * 필수 입력값
   */
  @IsNotEmpty()
  @IsEnum(RewardType)
  type: RewardType;

  /**
   * 보상 수량
   * 최소값: 1
   * 필수 입력값
   */
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;
}

/**
 * 보상 요청 DTO
 */
export class RewardRequestDto {
  /**
   * 사용자 ID
   * 필수 입력값
   */
  @IsNotEmpty()
  @IsString()
  userId: string;
}
