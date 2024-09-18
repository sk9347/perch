import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthService } from './auth.service';
import { RegisterUserInput } from './dto/registerUser.input';
import { RegisterOrganisationInput } from './dto/registerOrganisation.input';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from './guards/gql.guard';
import { Public } from './decorators/public.decorator';
import { UpdateAuthInput } from './dto/updateAuth.input';
import { Auth } from './entities/graphql/auth.type';

@Resolver((of: typeof String) => String)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation((returns) => String)
  async registerOrganisation(
    @Args('registerOrganisationInput')
    registerOrganisationInput: RegisterOrganisationInput,
  ) {
    return await this.authService.registerOrganisation(
      registerOrganisationInput,
    );
  }

  @Public()
  @Mutation((returns) => String)
  @UseGuards(GqlAuthGuard)
  async registerUser(
    @Args('registerUserInput') registerUserInput: RegisterUserInput,
    @Context() context: any,
  ) {
    const { organisationId } = context.req.user;
    return await this.authService.registerUser(
      registerUserInput,
      organisationId,
    );
  }

  @Public()
  @Mutation((returns) => String)
  async deleteUserInAuth(@Args('userId') userId: string) {
    return await this.authService.deleteUser(userId);
  }

  @Public()
  @Query((returns) => [Auth])
  async getAllUserIdsAndStatus(): Promise<Auth[]> {
    return this.authService.getAllUserIdsAndStatus();
  }

}
