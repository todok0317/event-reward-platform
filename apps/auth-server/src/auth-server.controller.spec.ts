import { Test, TestingModule } from '@nestjs/testing';
import { AuthServerController } from './auth-server.controller';
import { AuthServerService } from './auth-server.service';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('AuthServerController', () => {
  let controller: AuthServerController;
  let service: AuthServerService;

  beforeEach(async () => {
    const mockAuthServerService = {
      register: jest.fn(),
      login: jest.fn(),
      assignRole: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthServerController],
      providers: [
        {
          provide: AuthServerService,
          useValue: mockAuthServerService,
        },
      ],
    }).compile();

    controller = module.get<AuthServerController>(AuthServerController);
    service = module.get<AuthServerService>(AuthServerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const createUserDto = { username: 'test', password: 'test123' };
      const expectedResult = { username: 'test' };
      
      jest.spyOn(service, 'register').mockResolvedValue(expectedResult);
      
      const result = await controller.register(createUserDto);
      
      expect(service.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle conflict when username already exists', async () => {
      const createUserDto = { username: 'existing', password: 'test123' };
      
      jest.spyOn(service, 'register').mockRejectedValue(
        new ConflictException('Username already exists')
      );
      
      await expect(controller.register(createUserDto)).rejects.toThrow(ConflictException);
      expect(service.register).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should return JWT token on successful login', async () => {
      const loginUserDto = { username: 'test', password: 'test123' };
      const expectedResult = { access_token: 'jwt-token' };
      
      jest.spyOn(service, 'login').mockResolvedValue(expectedResult);
      
      const result = await controller.login(loginUserDto);
      
      expect(service.login).toHaveBeenCalledWith(loginUserDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle unauthorized when credentials are invalid', async () => {
      const loginUserDto = { username: 'test', password: 'wrong' };
      
      jest.spyOn(service, 'login').mockRejectedValue(
        new UnauthorizedException('Invalid credentials')
      );
      
      await expect(controller.login(loginUserDto)).rejects.toThrow(UnauthorizedException);
      expect(service.login).toHaveBeenCalledWith(loginUserDto);
    });
  });

  describe('assignRole', () => {
    it('should assign role to user', async () => {
      const userId = 'user-123';
      const assignRoleDto = { role: 'ADMIN' };
      const expectedResult = {
        _id: userId,
        username: 'test',
        roles: ['USER', 'ADMIN'],
      };
      
      jest.spyOn(service, 'assignRole').mockResolvedValue(expectedResult);
      
      const result = await controller.assignRole(userId, assignRoleDto);
      
      expect(service.assignRole).toHaveBeenCalledWith(userId, assignRoleDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const expectedResult = [
        { _id: 'user-1', username: 'user1', roles: ['USER'] },
        { _id: 'user-2', username: 'user2', roles: ['USER', 'ADMIN'] },
      ];
      
      jest.spyOn(service, 'findAll').mockResolvedValue(expectedResult);
      
      const result = await controller.findAll();
      
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      const userId = 'user-123';
      const expectedResult = {
        _id: userId,
        username: 'test',
        roles: ['USER'],
      };
      
      jest.spyOn(service, 'findById').mockResolvedValue(expectedResult);
      
      const result = await controller.findOne(userId);
      
      expect(service.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedResult);
    });
  });
});
