import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client'; // Adjust import path as needed

export const GetUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext): User | any => {
    const request = ctx.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user) {
      return null;
    }

    // If data is specified, return that specific property
    return data ? user[data] : user;
  },
);
