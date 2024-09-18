import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
  PreconditionFailedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import * as argon from 'argon2';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Actor } from './enums/actor.enum';
import { AuthEntity } from './entities/db/auth.entity';
import { RegisterUserInput } from './dto/registerUser.input';
import { RegisterOrganisationInput } from './dto/registerOrganisation.input';
import { JwtPayload } from './types/jwtPayload';
import { Status } from './enums/status.enum';
import { GraphQLClient, gql } from 'graphql-request';
import { NotifyEmailInput } from './dto/notifyEmail';
import { RegistrationInput } from './dto/registration.input';
import { SystemTokenInput } from './dto/systemToken.dto';
import { Token } from './types/token';
import { RegistrationMailInput } from './dto/registrationMail.dto';
import { UpdateAuthInput } from './dto/updateAuth.input';
import {
  isDateOfBirthValid,
  isDateOfJoiningValid,
} from './utils/dob-validation';
import LogExecutionTime from './decorators/LogExecutionTime';
import { extractTokenFromUrl } from './utils/helperFunction';
import { convertToISTDateTime } from './utils/date';

@Injectable()
export class AuthService {
  private PRODUCER_API;
  constructor(
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {
    const PRODUCER_API = this.config.get<string>('PRODUCER_API');
    if (!PRODUCER_API) {
      throw new ForbiddenException('Access Denied');
    }
    this.PRODUCER_API = PRODUCER_API;
  }

  async registerOrganisation(
    registerOrganisationInput: RegisterOrganisationInput,
  ): Promise<string> {
    const { email } = registerOrganisationInput;
    if (await this.isRecordExists(email)) {
      return 'Organisation Record already exists';
    }
    const authRecord = await this.saveAuth(email, Actor.ORGANISATION);
    const registrationInput: RegistrationInput = {
      authId: authRecord.authId,
      registrationType: Actor.ORGANISATION,
      request: JSON.stringify(registerOrganisationInput),
    };
    await this.registration(registrationInput);
    return 'Organisation registered successfully';
  }

  async registerUser(
    registerUserInput: RegisterUserInput,
    organisationId: string,
  ): Promise<string> {
    const { email } = registerUserInput;
    if (await this.isRecordExists(email)) {
      return 'User Record already exists';
    }
    this.validDateOfBirth(convertToISTDateTime(registerUserInput.dob));
    this.validDateOfJoining(
      convertToISTDateTime(registerUserInput.dateOfJoining),
    );
    const authRecord = await this.saveAuth(email, Actor.USER, organisationId);
    const registrationInput: RegistrationInput = {
      authId: authRecord.authId,
      registrationType: Actor.USER,
      organisationId: organisationId,
      request: JSON.stringify(registerUserInput),
    };
    await this.registration(registrationInput);
    return 'User registered successfully';

  }

  async saveAuth(email: string, actorType: Actor, organisationId?: string) {
    const auth = this.authRepository.create({
      email,
      actorType,
      organisationId,
    });
    return this.authRepository.save(auth);
  }

  async isRecordExists(email: string): Promise<boolean> {
    const auth = await this.getAuthByEmail(email);
    if (auth) {
      return true;
    }
    return false;
  }

  validDateOfBirth(dobDate: Date) {
    if (!isDateOfBirthValid(dobDate)) {
      throw new Error(
        'Date of birth must be in the past and the user must be 18 or older.',
      );
    }
  }

  validDateOfJoining(dateOfJoining: Date) {
    if (!isDateOfJoiningValid(dateOfJoining)) {
      throw new Error('Date of Joining must be of date instance');
    }
  }

  async validateUser(
    email: string,
    fromMagicRegistration: boolean = false,
    fromLogin: boolean = false,
  ): Promise<AuthEntity> {
    const auth = await this.getAuthByEmail(email);
    if (auth) {
      if (auth.status == Status.ACTIVE || fromMagicRegistration) {
        return auth;
      }
      throw new PreconditionFailedException(
        'Please Verify the Account Before Login..!',
      );
    }
    if (fromLogin) {
      throw new PreconditionFailedException('Please Register to Login..!');
    }
    throw new UnauthorizedException();
  }

  async validateUserByAuthId(authId: string): Promise<AuthEntity> {
    const auth = await this.getAuthByAuthId(authId);
    if (auth) {
      return auth;
    }
    throw new UnauthorizedException();
  }

  async generateToken(auth: AuthEntity) {
    const payload: JwtPayload = { email: auth.email, sub: auth.authId };
    const { access_token, refresh_token } = await this.createToken(payload);
    await this.updateRefreshToken(auth.authId, refresh_token);
    return {
      access_token,
      refresh_token,
    };
  }

  async generateRefreshToken(authId: string, refreshToken: string) {
    const authData = await this.getAuthByAuthId(authId);
    if (!authData || !authData.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }
    const isMatch = await argon.verify(authData.refreshToken, refreshToken);
    if (!isMatch) {
      throw new ForbiddenException('Invalid Refresh Token');
    }
    return await this.generateToken(authData);
  }

  async getAuthByEmail(email: string): Promise<AuthEntity | null> {
    return this.authRepository.findOneBy({ email });
  }

  async getAuthByAuthId(authId: string): Promise<AuthEntity | null> {
    return this.authRepository.findOneBy({ authId });
  }

  async updateRefreshToken(authId: string, refreshToken: string) {
    const auth = await this.getAuthByAuthId(authId);
    if (auth) {
      auth.refreshToken = await argon.hash(refreshToken);
      await this.authRepository.save(auth);
    }
  }

  async activateAccount(auth: AuthEntity) {
    const authData = await this.getAuthByAuthId(auth.authId);
    if (authData) {
      authData.status = Status.ACTIVE;
      await this.authRepository.save(authData);
    }
    return 'Account Activated';
  }

  async sendMagicLink(
    destination: string,
    href: any,
    isLogin: boolean = false,
  ) {
    const token = extractTokenFromUrl(JSON.parse(JSON.stringify(href)));
    const link = `${process.env.REDIRECT_URL}/token=${token}`;
    const registerBodyText = `Please click on the link to ACTIVATE your PERCH Account: ${href}`;
    const loginBodyText = `Please click on the link to LOGIN into your PERCH Account: ${href}`;
    const loginHTML = `<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <title>Login Confirmation</title>
</head>
<body>
   <img src='https://t3.ftcdn.net/jpg/06/54/95/44/360_F_654954441_j0IQ7pqSLus7dEVqXymemxbAc5SO3gS5.jpg' alt='Banner Image'>
    <table width='100%' cellspacing='0' cellpadding='0'>
        <tr>
            <td align='center' bgcolor='#f7f7f7'>
                <table width='600' cellspacing='0' cellpadding='0' bgcolor='#ffffff'>
                    <tr>
                        <td align='center' style='padding: 40px 0;'>
                            <h1>Login Confirmation</h1>
                        </td>
                    </tr>
                    <tr>
                        <td align='center' style='padding: 20px 0;'>
                            <p>Please click on the link to LOGIN into your PERCH Account</p>
                        </td>
                    </tr>
                    <tr>
                        <td align='center'>
                            <a href='${link}' target='_blank' style='display: inline-block; padding: 15px 30px; text-decoration: none; color: #ffffff; background-color: #007BFF; border-radius: 4px;'>Open Perch</a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

    const registerHTML = `<!DOCTYPE html><html><head><meta charset='utf-8'><title>Registration Confirmation</title></head><body><table width='100%' cellspacing='0' cellpadding='0'><tr><td align='center' bgcolor='#f7f7f7'><table width='600' cellspacing='0' cellpadding='0' bgcolor='#ffffff'><tr><td align='center' style='padding: 40px 0;'><h1>Registration Confirmation</h1></td></tr><tr><td align='center' style='padding: 20px 0;'><p>Please click on the link to ACTIVATE your PERCH Account</p></td></tr><tr><td align='center' style='padding: 20px 0;'><a href=${href} style='background-color: #007BFF; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Activate Account</a></td></tr></table></td></tr></table></body></html>`;
    const input: NotifyEmailInput = {
      to: destination,
      from: 'devops@smartgig.tech',
      subject: isLogin
        ? 'Magic Link Login: Your Instant Access Inside!'
        : 'Welcome Aboard! Verify Your Registration',
      bodyText: isLogin ? loginBodyText : registerBodyText,
      bodyHTML: isLogin ? loginHTML : registerHTML,
      isHtml: true,
    };

    const sendMagicLinkMutation = gql`
      mutation SendEmail($input: NotifyEmailInput!) {
        sendEmail(input: $input)
      }
    `;
    await new GraphQLClient(this.PRODUCER_API).request<any>(
      sendMagicLinkMutation,
      { input },
    );
  }

  @LogExecutionTime()
  async registration(request: RegistrationInput) {
    const register = gql`
      mutation Register($input: RegistrationInput!) {
        register(input: $input)
      }
    `;
    return await new GraphQLClient(
      this.PRODUCER_API,
    ).request<RegistrationInput>(register, { input: request });
  }

  async updateAuth(request: UpdateAuthInput) {
    let authData = await this.getAuthByAuthId(request.authId);
    if (authData) {
      if (request.registrationType === Actor.ORGANISATION) {
        authData.organisationId = request.id;
      } else {
        authData.userId = request.id;
      }
      return await this.authRepository.save(
        this.authRepository.create(authData),
      );
    }
    return null;
  }

  async generateSystemToken(request: SystemTokenInput) {
    let secret = await this.config.get<string>('SYSTEM_TOKEN_SECRET');
    if (!secret) {
      throw new ForbiddenException('Access Denied');
    }
    secret = await argon.hash(secret);
    const isSecretValid = await argon.verify(secret, request.secret);
    if (!isSecretValid) {
      throw new ForbiddenException('Access Denied');
    }
    const payload: JwtPayload = {
      email: 'devops@smartgig.tech',
      sub: request.authId,
      isSystemGenerated: true,
    };
    return await this.createToken(payload);
  }

  async createToken(payload: any): Promise<Token> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: '8h',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: '7d',
      }),
    ]);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async updateStatus(auth: AuthEntity) {}

  async redirectUrl(url: string, isMobile?: Boolean) {
    let updatedUrl = `perch://load/${url}`;
    let htmlTemplate = '';
    if (isMobile) {
      htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
      <script>
      var hasRedirected = sessionStorage.getItem('hasRedirected');

      if (!hasRedirected) {
          // Check if the URL starts with "perch://load/"
          if (!window.location.href.startsWith('perch://load/')) {
              // Perform the redirection
              window.location.replace('${updatedUrl}');

              // Set the flag in sessionStorage to indicate redirection
              sessionStorage.setItem('hasRedirected', true);
          }
      }
      </script>
      </head>
      <body>
          <!-- Your HTML content goes here -->
      </body>
      </html>
  `;
    } else {
      htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
      <script>
      window.location.replace('${process.env.ADMIN_URL}/loading/${url}');
      </script>
      </head>
      <body>
          <!-- Your HTML content goes here -->
      </body>
      </html>
  `;
    }
    return htmlTemplate;
  }

  async deleteUser(userId: string) {
    const authEntity = await this.authRepository.findOne({
      where: { userId: userId },
    });
    if (!authEntity) {
      throw new Error('Auth entity not found');
    }
    if (authEntity.status === 'DELETED') {
      return new Error('Auth is already deleted...!');
    }
    authEntity.updatedAt = new Date();
    authEntity.status = Status.DELETED; // Update status to DELETED
    await this.authRepository.save(authEntity);
    await this.deletion(userId);
    return 'user deleted successfully';
  }

  @LogExecutionTime()
  async deletion(userId: string) {
    const deleteUser = gql`
      mutation deleteUserInAuth($input: String!) {
        deleteUserProducer(userId: $input)
      }
    `;
    return await new GraphQLClient(this.PRODUCER_API).request<String>(
      deleteUser,
      { input: userId },
    );
  }
  async getAllUserIdsAndStatus(): Promise<AuthEntity[]> {
    return this.authRepository.find({
      select: ['userId', 'status'],
      where: {
        actorType: 'USER' as Actor, 
      },
    });
  }


}
