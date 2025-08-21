import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { prisma } from './test-db';
import { mockUsers } from './mock-data';

export async function createTestingModule(
  imports: any[],
  providers: any[] = [],
) {
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports,
    providers,
  }).compile();

  return moduleRef;
}

export async function createTestUser(userData = mockUsers.student) {
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  return prisma.user.create({
    data: {
      ...userData,
      password: hashedPassword,
    },
  });
}

export async function createTestCourse(courseData: any, authorId: string) {
  return prisma.course.create({
    data: {
      ...courseData,
      authorId,
      modules: {
        create: courseData.modules || [],
      },
    },
    include: {
      modules: true,
    },
  });
}

export async function generateJwtToken(userId: string, jwtService: JwtService) {
  return jwtService.sign({ sub: userId });
}

export function mockRequest(user?: any) {
  return {
    user,
    headers: {},
    body: {},
    params: {},
    query: {},
  };
}

export function mockResponse() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

export async function setupTestApp(
  module: TestingModule,
): Promise<INestApplication> {
  const app = module.createNestApplication();

  // Add global pipes, filters, interceptors as needed
  // app.useGlobalPipes(new ValidationPipe());

  await app.init();
  return app;
}
