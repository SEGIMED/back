import { IsOptional, IsString } from "class-validator";

export class CreateOrderTypeDto {
    
    @IsOptional()
    id:string

    @IsString()
    name: string

    @IsString()
    @IsOptional()
    description?: string

}
