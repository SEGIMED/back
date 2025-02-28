import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreatePhysicalExplorationAreaDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name_on_library: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string;
}
