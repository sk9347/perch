import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import {ExtractJwt, Strategy} from 'passport-jwt';
import { AuthService } from "src/auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt') {
    constructor(private readonly authService: AuthService, config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey:config.get<string>('ACCESS_TOKEN_SECRET')
        })
    }

    async validate(payload: any) {
        return await this.authService.validateUserByAuthId(payload.sub);
    }
}