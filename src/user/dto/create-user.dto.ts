import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  IsUrl,
  Length,
} from 'class-validator';
import { role_type } from '@prisma/client';

export class CreateUserDto {
  /**
   * Set full users name
   * @example 'Carlos Alberto Simancas Cuenca'
   */
  @IsString()
  @Length(2, 50)
  @IsString()
  @IsNotEmpty()
  name: string;

  /**
   * User's last Name
   * @example Simancas
   */
  @IsString()
  @Length(3, 50)
  @IsOptional()
  last_name:string;

  /**
   * Set the user's email
   * @example 'carlos@email.com'
   */
  @IsEmail()
  @IsNotEmpty()
  email: string;

  /**
   * Set the user's dni
   * @example 'ABX11503476'
   */
  @IsString()
  @Length(10, 15)
  @IsOptional()
  dni: string;

  /**
   * Set the user's birthdate
   * @example '2004-12-24T05:44:49.842Z'
   */
  @IsOptional()
  birthdate?: Date;

  /**
   * Set the user's nationality
   * @example 'Spanish'
   */
  @IsString()
  @Length(3, 50)
  @IsOptional()
  nationality: string;

  /**
   * Set the user's gender
   * @example 'Male'
   */
  @IsString()
  @Length(1, 14)
  @IsOptional()
  gender: string;

  /**
   * Set the user's country phone prefix
   * @example '0054'
   */
  @IsString()
  @Length(1, 4)
  @IsOptional()
  phone_prefix: string;

  /**
   * Set the user's phone number
   * @example '857823456'
   */
  @IsString()
  @Length(4, 20)
  @IsOptional()
  phone: string;

  /**
   * Set the user's password
   * @example 'MyUs3er@175'
   */
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minNumbers: 1,
    minLowercase: 1,
    minUppercase: 1,
    minSymbols: 1,
  })
  password: string;

  /**
   * The Google ID is optional and depends on the type of registration
   * @example ''
   */
  @IsString()
  @IsOptional()
  google_id?: string;

  /**
   * The user can change their image at any time; the default is a brand image
   * @example 'https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o='
   */
  @IsUrl()
  @IsOptional()
  image: string;

  /**
   * The type of role depends on the type of user
   * @example 'PATIENT'
   */
  @IsString()
  @IsOptional()
  role: role_type;

  /**
   * Represent the ID of the Organization
   */
  @IsOptional()
  tenant_id: string;

  // createdAt   DateTime    @default(now())
  // updatedAt   DateTime    @updatedAt
  // patients    Patient[]
  // physicians  Physician[]
}
