import { JwtPayload } from './jwtPayload';

export type JwtRefreshPayload = JwtPayload & { refreshToken: string };