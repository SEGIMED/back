// Test script para verificar el MedicationSchedulerService
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MedicationSchedulerService } from '../services/medication-scheduler/medication-scheduler.service';

async function testScheduler() {
  console.log('🚀 Iniciando test del MedicationSchedulerService...');

  try {
    const app = await NestFactory.createApplicationContext(AppModule);
    const schedulerService = app.get(MedicationSchedulerService);

    console.log('✅ Servicio obtenido correctamente');

    // Test manual del método principal
    console.log('🔄 Ejecutando processScheduledReminders...');
    await schedulerService.processScheduledReminders();
    console.log('✅ processScheduledReminders ejecutado exitosamente');

    await app.close();
    console.log('🎉 Test completado exitosamente');
  } catch (error) {
    console.error('❌ Error durante el test:', error);
    process.exit(1);
  }
}

testScheduler();
