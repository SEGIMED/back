import { PickType } from "@nestjs/mapped-types"
import { IsBoolean, IsDate, IsOptional, IsString } from "class-validator"
import { CreatePresHistoryDto } from "./create-pres-history.dto"

export class CreatePresModHistoryDto extends PickType(CreatePresHistoryDto, [
    'prescription_id',
    'physician_id',
    'mod_timestamp',
    'medical_event_id',
    'observations',
    'dose',
    'dose_units',
    'frecuency',
    'duration',
    'duration_units',
]) {

}
