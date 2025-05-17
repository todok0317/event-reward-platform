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

  async register(createUserDto: CreateUserDto): Promise<{ username: string }> {
    const { username, password } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ username }).exec();
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = new this.userModel({
      username,
      password: hashedPassword,
      roles: ['USER'], // Default role
    });
    
    await newUser.save();
    
    return { username: newUser.username };
  }

  async login(loginUserDto: LoginUserDto): Promise<{ access_token: string }> {
    const { username, password } = loginUserDto;
    
    // Find user
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    // Generate JWT
    const payload = { 
      sub: user._id.toString(),
      username: user.username,
      roles: user.roles,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async assignRole(userId: string, assignRoleDto: AssignRoleDto): Promise<User> {
    const { role } = assignRoleDto;
    
    // Valid roles
    const validRoles = ['USER', 'OPERATOR', 'AUDITOR', 'ADMIN'];
    if (!validRoles.includes(role)) {
      throw new ConflictException('Invalid role');
    }
    
    // Find user
    const user = await this.userModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Check if role already assigned
    if (user.roles.includes(role)) {
      return user;
    }
    
    // Add role
    user.roles.push(role);
    await user.save();
    
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
