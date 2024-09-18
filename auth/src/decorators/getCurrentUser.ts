import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtRefreshPayload } from '../types/jwtRefreshPayload';

export const GetCurrentUser = createParamDecorator(
  (data: keyof JwtRefreshPayload | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    if (!data) return request.user;
    return request.user[data];
  },
);