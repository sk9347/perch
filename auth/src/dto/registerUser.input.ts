import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  Matches,
} from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { Unique } from 'typeorm';
import { Transform } from 'class-transformer';

import { Gender } from 'src/enums/gender.enum';
import patterns from 'src/utils/patterns';
import { isDateOfBirthValid } from 'src/utils/dob-validation';
import { APP_CONSTANTS, DESCRIPTIONS } from 'src/constants';

@InputType()
@Unique(['email'])
export class RegisterUserInput {
  @Field({ description: DESCRIPTIONS.FULL_NAME_DESCRIPTION })
  @IsNotEmpty()
  @Matches(patterns.FULL_NAME, { message: DESCRIPTIONS.FULL_NAME_DESCRIPTION })
  @Matches(patterns.WHITESPACE, {
    message: `name ${DESCRIPTIONS.WHITE_SPACE_DESCRIPTION}`,
  })
  fullName: string;

  @Field({ description: DESCRIPTIONS.EMAIL_DESCRIPTION })
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @Field({ description: DESCRIPTIONS.EMPLOYEE_ID_DESCRIPTION })
  @IsNotEmpty()
  @Matches(patterns.WHITESPACE, {
    message: `EmployeeId ${DESCRIPTIONS.WHITE_SPACE_DESCRIPTION}`,
  })
  employeeId: string;

  @Field({ description: DESCRIPTIONS.GROUP_ID_DESCRIPTION })
  @IsNotEmpty()
  @Matches(patterns.WHITESPACE, {
    message: `groupId ${DESCRIPTIONS.WHITE_SPACE_DESCRIPTION}`,
  })
  groupId: string;

  @Field({ description: DESCRIPTIONS.ROLE_ID_DESCRIPTION })
  @IsNotEmpty()
  @Matches(patterns.WHITESPACE, {
    message: `roleId ${DESCRIPTIONS.WHITE_SPACE_DESCRIPTION}`,
  })
  roleId: string;

  @Field({
    description: DESCRIPTIONS.LOCATION_ID_DESCRIPTION,
  })
  @IsNotEmpty()
  @Matches(patterns.WHITESPACE, {
    message: `locationId ${DESCRIPTIONS.WHITE_SPACE_DESCRIPTION}`,
  })
  locationId: string;

  @Field({
    description: DESCRIPTIONS.BRANCH_ID_DESCRIPTION,
  })
  @IsNotEmpty()
  @Matches(patterns.WHITESPACE, {
    message: `branchId ${DESCRIPTIONS.WHITE_SPACE_DESCRIPTION}`,
  })
  branchId: string;

  @Field({
    nullable: true,
    description: DESCRIPTIONS.MOBILE_DESCRIPTION,
  })
  @IsOptional()
  @Matches(patterns.CONTACT_NUMBER, {
    message: DESCRIPTIONS.MOBILE_MATCH_DESCRIPTION,
  })
  mobile: string;

  @Field(() => Gender, {
    description: DESCRIPTIONS.GENDER_DESCRIPTION,
  })
  @IsNotEmpty()
  @IsEnum(Gender)
  gender: string;

  @Field({
    description: DESCRIPTIONS.DOB_DESCRIPTION,
  })
  @IsNotEmpty()
  @Matches(patterns.DOB, {
    message: `${APP_CONSTANTS.DATE_OF_BIRTH} ${DESCRIPTIONS.DATE_MATCH_DESCRIPTION}`,
  })
  dob: string;

  @Field({
    description: DESCRIPTIONS.DOJ_DESCRIPTION,
  })
  @IsNotEmpty()
  @Matches(patterns.DOB, {
    message: `${APP_CONSTANTS.DATE_OF_JOINING} ${DESCRIPTIONS.DATE_MATCH_DESCRIPTION}`,
  })
  dateOfJoining: string;

}
