import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../../src/auth/auth.service';
import { UsersService } from '../../../src/users/users.service';
import { CreateUserDto } from '../../../src/users/dto/create-user.dto';
import { LoginUserDto } from '../../../src/users/dto/login-user.dto';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            validatePassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'john@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.STUDENT,
        isPremium: false,
        isActive: false,
        profilePicture: 'https://example.com/default-profile.jpg',
        bio: 'This is a sample bio for the user.',
      };

      const mockUser = {
        id: 'user-123',
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role,
      };

      jest.spyOn(usersService, 'create').mockResolvedValue(mockUser as any);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mock-jwt-token');

      const result = await service.register(createUserDto);

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.email).toBe(createUserDto.email);
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw BadRequestException on user creation error', async () => {
      const createUserDto: CreateUserDto = {
        email: 'john@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.STUDENT,
        isPremium: false,
        isActive: false,
        profilePicture: 'https://example.com/default-profile.jpg',
        bio: 'This is a sample bio for the user.',
      };

      jest
        .spyOn(usersService, 'create')
        .mockRejectedValue(new Error('User already exists'));

      await expect(service.register(createUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const loginDto: LoginUserDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-123',
        email: loginDto.email,
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.STUDENT,
        password: 'hashedpassword',
      };

      jest
        .spyOn(usersService, 'findByEmail')
        .mockResolvedValue(mockUser as any);
      jest.spyOn(usersService, 'validatePassword').mockResolvedValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue('mock-jwt-token');

      const result = await service.login(loginDto);

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.email).toBe(loginDto.email);
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      const loginDto: LoginUserDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const loginDto: LoginUserDto = {
        email: 'john@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: 'user-123',
        email: loginDto.email,
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.STUDENT,
        password: 'hashedpassword',
      };

      jest
        .spyOn(usersService, 'findByEmail')
        .mockResolvedValue(mockUser as any);
      jest.spyOn(usersService, 'validatePassword').mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
