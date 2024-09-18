import { AuthGuard } from '@nestjs/passport';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.dto';
import { MagicLoginStrategy } from './strategies/magicLogin.strategy';
import { Public } from './decorators/public.decorator';
import { JwtRefreshGuard } from './guards/jwtRefresh.guard';
import { GetCurrentUser } from './decorators/getCurrentUser';
import { GetCurrentAuthId } from './decorators/getCurrentAuthId';
import { JwtGuard } from './guards/jwt.guard';
import { SystemTokenInput } from './dto/systemToken.dto';
import { RegistrationMailInput } from './dto/registrationMail.dto';
import { MagicRegisterStrategy } from './strategies/magicRegister.strategy';
import { UpdateAuthInput } from './dto/updateAuth.input';
import { APP_CONSTANTS } from './constants';

@Controller('api/v1')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly magicLoginStrategy: MagicLoginStrategy,
    private readonly magicRegisterStrategy: MagicRegisterStrategy,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: any,
    @Res() res: any,
    @Body(new ValidationPipe()) body: LoginInput,
  ) {
    await this.authService.validateUser(body.destination, false, true);
    return this.magicLoginStrategy.send(req, res);
  }

  @Public()
  @UseGuards(AuthGuard('magiclogin'))
  @Get('callback')
  async callback(@Req() req: any) {
    return this.authService.generateToken(req.user);
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refreshToken')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @GetCurrentAuthId() authId: string,
    @GetCurrentUser('refreshToken') refreshToken: string,
    @Req() req: any,
  ) {
    return this.authService.generateRefreshToken(authId, refreshToken);
  }

  @Post('validate')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async validate(
    @GetCurrentAuthId() authId: string,
    @Req() req: any,
    @GetCurrentUser() data: any,
  ) {
    return data;
  }

  @Public()
  @Post('generateSystemToken')
  @HttpCode(HttpStatus.OK)
  async generateSystemToken(@Body() request: SystemTokenInput) {
    return this.authService.generateSystemToken(request);
  }

  @Public()
  @Post('sendRegistrationMail')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async sendRegistrationMail(
    @Req() req: any,
    @Res() res: any,
    @Body(new ValidationPipe()) body: UpdateAuthInput,
  ) {
    const request = await this.authService.updateAuth(body);
    if (!request) {
      throw new Error('User not found');
    }
    req.body.destination = request.email;
    return this.magicRegisterStrategy.send(req, res);
  }

  @Public()
  @UseGuards(AuthGuard('magicregister'))
  @Get('verify')
  @HttpCode(HttpStatus.OK)
  async validateSystemToken(@Req() req: any) {
    return this.authService.activateAccount(req.user);
  }

  @Public()
  @Get('redirect/:url')
  @HttpCode(HttpStatus.OK)
  async redirectUrl(@Param('url') url: string, @Req() request: Request) {
    const headers: { [key: string]: string } = Object.fromEntries(
      Object.entries(request.headers),
    );

    const userAgent = headers['user-agent'];
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent,
      );

    return this.authService.redirectUrl(url, isMobile);
  }

  @Post('resendVerificationLink')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async resendVerificationLink(
    @Req() req: any,
    @Res() res: any,
    @Body(new ValidationPipe()) body: LoginInput,
  ) {
    try {
      const result = await this.authService.getAuthByEmail(
        req.body.destination,
      );
      if (result) {
        if (result.status == APP_CONSTANTS.INACTIVE) {
          this.magicRegisterStrategy.send(req, res);
          return result;
        } else if (result.status == APP_CONSTANTS.ACTIVE) {
          return 'User Already Activated..!';
        }
        else{
          return 'User has been Deleted..!';
        }
      } else {
        return 'User Not Found...!';
      }
    } catch (err) {
      console.log('Error', err);
    }
  }
}
