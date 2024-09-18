import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetCurrentAuthId = createParamDecorator(
  (_: undefined, context: ExecutionContext): string => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user.sub?user.sub:user.authId;
  },
);