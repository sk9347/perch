export type JwtPayload = {
    email: string;
    sub: string;
    isSystemGenerated?: boolean;
  };