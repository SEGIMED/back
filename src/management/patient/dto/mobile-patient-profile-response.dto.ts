import { ApiProperty } from '@nestjs/swagger';

export class VitalSignMobileDto {
  @ApiProperty({
    description: 'ID único del signo vital',
    example: 'uuid-vital-sign',
  })
  id: string;

  @ApiProperty({
    description: 'Categoría del signo vital',
    example: 'Presión Arterial',
  })
  vital_sign_category: string;

  @ApiProperty({
    description: 'Valor medido del signo vital',
    example: 120,
  })
  measure: number;

  @ApiProperty({
    description: 'Unidad de medida del signo vital',
    example: 'mmHg',
  })
  vital_sign_measure_unit: string;
}

export class FileMobileDto {
  @ApiProperty({
    description: 'ID único del archivo',
    example: 'uuid-file',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del archivo médico',
    example: 'Radiografía de Tórax',
  })
  name: string;

  @ApiProperty({
    description: 'URL de acceso al archivo',
    example: 'https://example.com/file.pdf',
  })
  url: string;
}

export class EvaluationMobileDto {
  @ApiProperty({
    description: 'ID único de la evaluación médica',
    example: 'uuid-evaluation',
  })
  id: string;

  @ApiProperty({
    description: 'Detalles de la evaluación médica',
    example: 'Evaluación médica reciente del paciente',
  })
  details: string;

  @ApiProperty({
    description: 'Fecha de la evaluación médica',
    type: Date,
    example: '2024-01-10T15:30:00Z',
  })
  date: Date;
}

export class BackgroundMobileDto {
  @ApiProperty({
    description: 'ID único de los antecedentes médicos',
    example: 'uuid-background',
  })
  id: string;

  @ApiProperty({
    description: 'Detalles completos de antecedentes médicos del paciente',
    example:
      'Vacunas: COVID-19, Influenza\nAlergias: Penicilina\nAntecedentes patológicos: Hipertensión',
  })
  details: string;

  @ApiProperty({
    description: 'Fecha de registro de antecedentes',
    type: Date,
    example: '2024-01-01T00:00:00Z',
  })
  date: Date;
}

export class MedicationMobileDto {
  @ApiProperty({
    description: 'ID único de la medicación',
    example: 'uuid-medication',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del medicamento',
    example: 'Aspirina',
  })
  name: string;

  @ApiProperty({
    description: 'Dosis del medicamento',
    example: '100 mg',
  })
  dosage: string;

  @ApiProperty({
    description: 'Instrucciones de administración',
    example: 'Cada 8 horas, durante 7 días',
  })
  instructions: string;

  @ApiProperty({
    description: 'Estado activo de la medicación',
    example: true,
  })
  active: boolean;
}

export class MedicalEventMobileDto {
  @ApiProperty({
    description: 'ID único del evento médico',
    example: 'uuid-appointment',
  })
  id: string;

  @ApiProperty({
    description: 'Fecha del evento médico',
    type: Date,
    example: '2024-01-20T10:00:00Z',
  })
  date: Date;

  @ApiProperty({
    description: 'Hora del evento en formato HH:MM',
    example: '10:00',
  })
  time: string;

  @ApiProperty({
    description: 'Nombre completo del médico',
    example: 'Dr. García',
  })
  doctor: string;

  @ApiProperty({
    description: 'Motivo o razón del evento médico',
    example: 'Control general',
  })
  reason: string;

  @ApiProperty({
    description: 'Estado del evento médico',
    enum: ['pendiente', 'atendida', 'cancelada', 'reprogramada'],
    example: 'pendiente',
  })
  status: string;
}

export class PatientProfileMobileResponseDto {
  @ApiProperty({
    description: 'ID único del paciente',
    example: 'uuid-patient',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre del paciente',
    example: 'Juan',
  })
  name: string;

  @ApiProperty({
    description: 'Apellido del paciente',
    example: 'Pérez',
  })
  last_name: string;

  @ApiProperty({
    description: 'URL de la imagen/foto del paciente',
    example: 'https://example.com/patient.jpg',
    nullable: true,
  })
  image?: string;

  @ApiProperty({
    description: 'Edad calculada del paciente',
    example: 35,
  })
  age: number;

  @ApiProperty({
    description: 'Fecha de nacimiento del paciente',
    type: Date,
    example: '1989-01-15T00:00:00Z',
  })
  birth_date: Date;
  @ApiProperty({
    description: 'Dirección completa del paciente',
    example: 'Av. Principal 123, Col. Centro',
    nullable: true,
  })
  direction?: string;

  @ApiProperty({
    description: 'Ciudad de residencia del paciente',
    example: 'Ciudad de México',
    nullable: true,
  })
  city?: string;

  @ApiProperty({
    description: 'Provincia o estado del paciente',
    example: 'CDMX',
    nullable: true,
  })
  province?: string;

  @ApiProperty({
    description: 'País de residencia del paciente',
    example: 'México',
    nullable: true,
  })
  country?: string;

  @ApiProperty({
    description: 'Código postal del paciente',
    example: '12345',
    nullable: true,
  })
  postal_code?: string;
  @ApiProperty({
    description: 'Teléfono del paciente',
    example: '+1234567890',
    nullable: true,
  })
  phone?: string;

  @ApiProperty({
    description: 'Email del paciente',
    example: 'juan.perez@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Notas adicionales del paciente',
    example: 'Notas importantes sobre el paciente',
    nullable: true,
  })
  notes?: string;

  @ApiProperty({
    description: 'Signos vitales más recientes del paciente',
    type: [VitalSignMobileDto],
  })
  vital_signs: VitalSignMobileDto[];

  @ApiProperty({
    description: 'Archivos médicos (estudios) del paciente',
    type: [FileMobileDto],
  })
  files: FileMobileDto[];

  @ApiProperty({
    description: 'Última evaluación médica del paciente',
    type: EvaluationMobileDto,
    nullable: true,
  })
  evaluation?: EvaluationMobileDto;

  @ApiProperty({
    description: 'Antecedentes médicos del paciente',
    type: BackgroundMobileDto,
    nullable: true,
  })
  background?: BackgroundMobileDto;

  @ApiProperty({
    description: 'Medicaciones activas actuales del paciente',
    type: [MedicationMobileDto],
  })
  current_medication: MedicationMobileDto[];

  @ApiProperty({
    description: 'Eventos médicos futuros (citas próximas)',
    type: [MedicalEventMobileDto],
  })
  future_medical_events: MedicalEventMobileDto[];

  @ApiProperty({
    description: 'Eventos médicos pasados (historial de citas)',
    type: [MedicalEventMobileDto],
  })
  past_medical_events: MedicalEventMobileDto[];
}

export class UpdatePatientProfileMobileResponseDto {
  @ApiProperty({
    description: 'Mensaje de confirmación de la actualización',
    example: 'Perfil actualizado correctamente',
  })
  message: string;
}
