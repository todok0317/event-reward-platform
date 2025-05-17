import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  /**
   * 사용자 이름
   * 고유한 값으로 사용되어 로그인 시 식별자로 활용됨
   */
  @Prop({ required: true, unique: true })
  username: string;

  /**
   * 사용자 비밀번호
   * 해시된 형태로 저장됨
   */
  @Prop({ required: true })
  password: string;

  /**
   * 사용자 역할 목록
   * 기본값: ['USER']
   * 가능한 역할: USER, OPERATOR, AUDITOR, ADMIN
   */
  @Prop({ default: ['USER'] })
  roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
