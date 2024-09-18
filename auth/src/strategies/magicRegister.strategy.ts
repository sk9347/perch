import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import Strategy from 'passport-magic-login';

import { AuthService } from 'src/auth.service';

@Injectable()
export class MagicRegisterStrategy extends PassportStrategy(Strategy,'magicregister') {
  constructor(
    private readonly authService: AuthService,
    config: ConfigService,
  ) {
    super({
      secret: config.get<string>('MAGIC_REGISTER_SECRET'),
      jwtOptions: {
        expiresIn: config.get<string>('MAGIC_LINK_EXPIRY'),
      },
      callbackUrl: config.get<string>('MAGIC_REGISTER_CALLBACK_URL'),
      sendMagicLink: async (destination: string, href: any) => {
        console.log('Magic Verify Registration', destination, href);
        await this.authService.sendMagicLink(destination, href);
      },
      verify: async (payload: any, callback: any) => {
        callback(null, this.validate(payload));
      },
    });
  }

  validate(payload: { destination: string }) {
    const authData = this.authService.validateUser(payload.destination, true);
    return authData;
  }
}
