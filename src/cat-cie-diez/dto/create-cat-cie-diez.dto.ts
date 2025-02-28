import { IsString } from "class-validator";

export class CreateCatCieDiezDto {
    /**
     * Category code
     * @example "A001"
     */
    @IsString()
    code: string;

    /**
     * Category description
     * @example "Fiebres tifoidea y paratifoidea"
     */
    @IsString()
    description: string;
}
