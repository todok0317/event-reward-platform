import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './models/user.schema';
import { CreateUserDto, LoginUserDto, AssignRoleDto } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthServerService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  /**
   * 사용자 등록
   * @param createUserDto 사용자 생성 DTO (username, password)
   * @returns 생성된 사용자 정보 (비밀번호 제외)
   */
  async register(createUserDto: CreateUserDto): Promise<{ username: string }> {
    const { username, password } = createUserDto;

    // 사용자명 중복 확인
    const existingUser = await this.userModel.findOne({ username }).exec();
    if (existingUser) {
      throw new ConflictException('이미 존재하는 사용자명입니다');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 새 사용자 생성
    const newUser = new this.userModel({
      username,
      password: hashedPassword,
      roles: ['USER'], // 기본 역할
    });
    
    await newUser.save();
    
    return { username: newUser.username };
  }

  /**
   * 로그인
   * @param loginUserDto 로그인 DTO (username, password)
   * @returns JWT 토큰
   */
  async login(loginUserDto: LoginUserDto): Promise<{ access_token: string }> {
    const { username, password } = loginUserDto;
    
    // 사용자 찾기
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new UnauthorizedException('잘못된 인증 정보입니다');
    }
    
    // 비밀번호 검증
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('잘못된 인증 정보입니다');
    }
    
    // JWT 생성
    const payload = { 
      sub: user._id.toString(),
      username: user.username,
      roles: user.roles,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * 사용자에게 역할 할당
   * @param userId 사용자 ID
   * @param assignRoleDto 역할 할당 DTO (role)
   * @returns 업데이트된 사용자 정보
   */
  async assignRole(userId: string, assignRoleDto: AssignRoleDto): Promise<User> {
    const { role } = assignRoleDto;
    
    // 유효한 역할 목록
    const validRoles = ['USER', 'OPERATOR', 'AUDITOR', 'ADMIN'];
    if (!validRoles.includes(role)) {
      throw new ConflictException('유효하지 않은 역할입니다');
    }
    
    // 사용자 찾기
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }
    
    // 이미 역할이 할당되어 있는지 확인
    if (user.roles.includes(role)) {
      return user;
    }
    
    // 역할 추가
    user.roles.push(role);
    await user.save();
    
    return user;
  }

  /**
   * 모든 사용자 조회
   * @returns 사용자 목록
   */
  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  /**
   * ID로 사용자 조회
   * @param id 사용자 ID
   * @returns 사용자 정보
   */
  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }
    return user;
  }
}
