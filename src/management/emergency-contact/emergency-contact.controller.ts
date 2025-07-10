import { Body, Controller, Post } from '@nestjs/common';
import { CreateEmergencyContactDto } from './dto/create-emergency-contact.dto';
import { EmergencyContactService } from './emergency-contact.service';

@Controller('emergency-contact')
export class EmergencyContactController {
  constructor(private readonly emergencyContactService: EmergencyContactService) {}

  @Post('create')
  async create(@Body() createEmergencyContactDto: CreateEmergencyContactDto) {
    return this.emergencyContactService.create(createEmergencyContactDto);
  }
}
