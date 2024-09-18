import { Field, InputType } from '@nestjs/graphql';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { DESCRIPTIONS } from 'src/constants';
import patterns from 'src/utils/patterns';
import { Unique } from 'typeorm';

@InputType()
@Unique(['email'])
export class RegisterOrganisationInput {
  @Field()
  @IsNotEmpty()
  organisationName: string;

  @Field()
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @Field({ nullable: true })
  @IsOptional()
  @Matches(patterns.CONTACT_NUMBER, {
    message: DESCRIPTIONS.MOBILE_MATCH_DESCRIPTION,
  })
  contactNumber: string;

  @Field({ nullable: true })
  @IsOptional()
  @Matches(patterns.DOMAIN, {
    message: DESCRIPTIONS.DOMAIN_MATCH_DESCRIPTION,
  })
  domain: string; 

  @Field({ nullable: true })
  @IsOptional()
  @Matches(patterns.WEBSITE, {
    message: DESCRIPTIONS.WEBSITE_MATCH_DESCRIPTION,
  })
  website: string;

  @Field({ nullable: true, description: DESCRIPTIONS.LOGO_DESCRIPTION })
  @IsOptional()
  logo: string;
}
