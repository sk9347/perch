import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-magic-login';

import { AuthService } from 'src/auth.service';

@Injectable()
export class MagicLoginStrategy extends PassportStrategy(Strategy,'magiclogin') {
  constructor(
    private readonly authService: AuthService,
    config: ConfigService,
  ) {
    super({
      secret: config.get<string>('MAGIC_LOGIN_SECRET'),
      jwtOptions: {
        expiresIn: config.get<string>('MAGIC_LINK_EXPIRY'),
      },
      callbackUrl: config.get<string>('MAGIC_LOGIN_CALLBACK_URL'),
      sendMagicLink: async (destination: string, href: any) => {
        console.log('sendMagicLink', destination, href);
        await this.authService.sendMagicLink(destination, href, true);
      },
      verify: async (payload: any, callback: any) => {
        callback(null, this.validate(payload));
      },
    });
  }

  validate(payload: { destination: string }) {
    const authData = this.authService.validateUser(payload.destination);
    return authData;
  }
}
