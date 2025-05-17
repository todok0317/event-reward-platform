import { IsNotEmpty, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { RewardType } from '../models/reward.schema';

export class CreateRewardDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsEnum(RewardType)
  type: RewardType;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;
}

export class RewardRequestDto {
  @IsNotEmpty()
  @IsString()
  userId: string;
}
