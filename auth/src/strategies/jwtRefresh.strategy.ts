import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from 'src/auth.service';
import { JwtPayload } from 'src/types/jwtPayload';
import { JwtRefreshPayload } from 'src/types/jwtRefreshPayload';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly authService: AuthService,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('REFRESH_TOKEN_SECRET'),
      passReqToCallback: true,
    });
  }

   validate(req: any, payload: JwtPayload): JwtRefreshPayload {
    const refreshToken = req?.get('authorization')?.replace('Bearer', '').trim();
    if (!refreshToken) throw new ForbiddenException('Refresh token malformed');
    return {
      ...payload,
      refreshToken,
    };
  }
}
