import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { prisma } from '../utils/test-db';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';
import { UserRole } from '@prisma/client';

describe('Auth Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register new user and return JWT token', async () => {
      const createUserDto: CreateUserDto = {
        email: 'john.doe@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.STUDENT,
        isPremium: false,
        isActive: false,
        profilePicture: 'https://example.com/default-profile.jpg',
        bio: 'This is a sample bio for the user.',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(createUserDto)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user).toMatchObject({
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role,
      });

      // Verify user exists in database
      const user = await prisma.user.findUnique({
        where: { email: createUserDto.email },
      });
      expect(user).toBeDefined();
      expect(user.email).toBe(createUserDto.email);
    });

    it('should return 400 for invalid email format', async () => {
      const invalidUserDto = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidUserDto)
        .expect(400);
    });

    it('should return 400 for password too short', async () => {
      const invalidUserDto = {
        email: 'john@example.com',
        password: '123',
        firstName: 'John',
        lastName: 'Doe',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(invalidUserDto)
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    beforeEach(async () => {
      // Register a test user
      const createUserDto: CreateUserDto = {
        email: 'login.test@example.com',
        password: 'SecurePass123!',
        firstName: 'Login',
        lastName: 'Test',
        role: UserRole.STUDENT,
        isPremium: false,
        isActive: false,
        profilePicture: 'https://example.com/default-profile.jpg',
        bio: 'Test user for login',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(createUserDto);
    });

    it('should login with valid credentials', async () => {
      const loginDto = {
        email: 'login.test@example.com',
        password: 'SecurePass123!',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body.user.email).toBe(loginDto.email);
    });

    it('should return 401 for invalid credentials', async () => {
      const loginDto = {
        email: 'login.test@example.com',
        password: 'WrongPassword123!',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });

    it('should return 401 for non-existent user', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'SecurePass123!',
      };

      await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });
  });

  describe('/auth/profile (GET)', () => {
    let authToken: string;

    beforeEach(async () => {
      // Register and login to get token
      const createUserDto: CreateUserDto = {
        email: 'profile.test@example.com',
        password: 'SecurePass123!',
        firstName: 'Profile',
        lastName: 'Test',
        role: UserRole.STUDENT,
        isPremium: false,
        isActive: false,
        profilePicture: 'https://example.com/default-profile.jpg',
        bio: 'Test user for profile',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(createUserDto);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: createUserDto.email,
          password: createUserDto.password,
        });

      authToken = loginResponse.body.access_token;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.email).toBe('profile.test@example.com');
      expect(response.body.firstName).toBe('Profile');
      expect(response.body.lastName).toBe('Test');
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer()).get('/auth/profile').expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
