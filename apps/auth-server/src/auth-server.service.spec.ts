import { Test, TestingModule } from '@nestjs/testing';
import { AuthServerService } from './auth-server.service';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './models/user.schema';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthServerService', () => {
  let service: AuthServerService;
  let jwtService: JwtService;
  let userModel: any;

  beforeEach(async () => {
    const mockUserModel = {
      findOne: jest.fn(),
      findById: jest.fn(),
      find: jest.fn(),
      constructor: jest.fn().mockImplementation(() => ({
        save: jest.fn().mockResolvedValue({
          _id: 'some-id',
          username: 'test',
          roles: ['USER'],
        }),
      })),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('test-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthServerService,
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthServerService>(AuthServerService);
    jwtService = module.get<JwtService>(JwtService);
    userModel = module.get(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      userModel.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const createUserDto = { username: 'test', password: 'test123' };
      const result = await service.register(createUserDto);

      expect(userModel.findOne).toHaveBeenCalledWith({ username: 'test' });
      expect(bcrypt.hash).toHaveBeenCalledWith('test123', 10);
      expect(result).toEqual({ username: 'test' });
    });

    it('should throw ConflictException if username already exists', async () => {
      userModel.findOne.mockResolvedValue({ username: 'test' });

      const createUserDto = { username: 'test', password: 'test123' };
      await expect(service.register(createUserDto)).rejects.toThrow(
        new ConflictException('Username already exists')
      );
      
      expect(userModel.findOne).toHaveBeenCalledWith({ username: 'test' });
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should return JWT token on successful login', async () => {
      const mockUser = {
        _id: 'user-id',
        username: 'test',
        password: 'hashed-password',
        roles: ['USER'],
      };
      userModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const loginUserDto = { username: 'test', password: 'test123' };
      const result = await service.login(loginUserDto);

      expect(userModel.findOne).toHaveBeenCalledWith({ username: 'test' });
      expect(bcrypt.compare).toHaveBeenCalledWith('test123', 'hashed-password');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-id',
        username: 'test',
        roles: ['USER'],
      });
      expect(result).toEqual({ access_token: 'test-token' });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      userModel.findOne.mockResolvedValue(null);

      const loginUserDto = { username: 'test', password: 'test123' };
      await expect(service.login(loginUserDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials')
      );
      
      expect(userModel.findOne).toHaveBeenCalledWith({ username: 'test' });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockUser = {
        username: 'test',
        password: 'hashed-password',
      };
      userModel.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const loginUserDto = { username: 'test', password: 'wrong-password' };
      await expect(service.login(loginUserDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials')
      );
      
      expect(userModel.findOne).toHaveBeenCalledWith({ username: 'test' });
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong-password', 'hashed-password');
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('assignRole', () => {
    it('should add role to user', async () => {
      const mockUser = {
        _id: 'user-id',
        username: 'test',
        roles: ['USER'],
        save: jest.fn().mockResolvedValue({
          _id: 'user-id',
          username: 'test',
          roles: ['USER', 'ADMIN'],
        }),
      };
      userModel.findById.mockResolvedValue(mockUser);

      const result = await service.assignRole('user-id', { role: 'ADMIN' });

      expect(userModel.findById).toHaveBeenCalledWith('user-id');
      expect(mockUser.roles).toContain('ADMIN');
      expect(mockUser.save).toHaveBeenCalled();
      expect(result.roles).toEqual(['USER', 'ADMIN']);
    });

    it('should throw NotFoundException if user not found', async () => {
      userModel.findById.mockResolvedValue(null);

      await expect(service.assignRole('non-existent-id', { role: 'ADMIN' })).rejects.toThrow(
        new NotFoundException('User not found')
      );
      
      expect(userModel.findById).toHaveBeenCalledWith('non-existent-id');
    });

    it('should throw ConflictException if role is invalid', async () => {
      await expect(service.assignRole('user-id', { role: 'INVALID_ROLE' })).rejects.toThrow(
        new ConflictException('Invalid role')
      );
      
      expect(userModel.findById).not.toHaveBeenCalled();
    });

    it('should not add role if user already has it', async () => {
      const mockUser = {
        _id: 'user-id',
        username: 'test',
        roles: ['USER', 'ADMIN'],
        save: jest.fn(),
      };
      userModel.findById.mockResolvedValue(mockUser);

      const result = await service.assignRole('user-id', { role: 'ADMIN' });

      expect(userModel.findById).toHaveBeenCalledWith('user-id');
      expect(mockUser.save).not.toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const mockUsers = [
        { _id: 'user-1', username: 'user1', roles: ['USER'] },
        { _id: 'user-2', username: 'user2', roles: ['USER', 'ADMIN'] },
      ];
      userModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUsers),
      });

      const result = await service.findAll();

      expect(userModel.find).toHaveBeenCalled();
      expect(result).toEqual(mockUsers);
    });

    it('should return empty array if no users found', async () => {
      userModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findAll();

      expect(userModel.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const mockUser = { _id: 'user-id', username: 'test', roles: ['USER'] };
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await service.findById('user-id');

      expect(userModel.findById).toHaveBeenCalledWith('user-id');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user not found', async () => {
      userModel.findById.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findById('non-existent-id')).rejects.toThrow(
        new NotFoundException('User not found')
      );
      
      expect(userModel.findById).toHaveBeenCalledWith('non-existent-id');
    });
  });
});
