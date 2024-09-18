import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import {
  ApolloFederationDriverConfig,
  ApolloFederationDriver,
} from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';

import { AuthEntity } from './entities/db/auth.entity';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { MagicLoginStrategy } from './strategies/magicLogin.strategy';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwtRefresh.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './guards/jwt.guard';
import { MagicRegisterStrategy } from './strategies/magicRegister.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
      },
      useGlobalPrefix: true,
      path:''
    }),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.DB_URI,
      database: process.env.DB_NAME,
      synchronize: true,
      useUnifiedTopology: true,
      entities: [AuthEntity],
    }),
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'client'),
    // }),

    TypeOrmModule.forFeature([AuthEntity]),
    PassportModule,
    JwtModule.register({}),
  ],
  providers: [
    AuthResolver,
    AuthService,
    MagicLoginStrategy,
    MagicRegisterStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
  controllers: [AuthController],
})
export class AppModule {}
