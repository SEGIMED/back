export enum Permission {
  CONFIGURE_SYSTEM_SETTINGS = 'configurar_ajustes_del_sistema',

  // Gestión de Médicos
  VIEW_DOCTORS_LIST = 'ver_listado_de_medicos',
  VIEW_DOCTOR_DETAILS = 'ver_detalles_de_medico',
  EDIT_DOCTOR_INFO = 'editar_informacion_de_medico',
  DELETE_DOCTORS = 'eliminar_medicos',
  ACCESS_DOCTOR_INDICATORS = 'acceder_a_indicadores_de_medicos',

  // Gestión de Pacientes
  VIEW_PATIENTS_LIST = 'ver_listado_de_pacientes',
  VIEW_PATIENT_DETAILS = 'ver_detalles_de_paciente',
  EDIT_PATIENT_INFO = 'editar_informacion_de_paciente',
  DELETE_PATIENTS = 'eliminar_pacientes',
  ACCESS_PATIENT_INDICATORS = 'acceder_a_indicadores_del_paciente',

  // Tratamientos y Diagnósticos
  ASSIGN_TREATMENTS = 'asignar_tratamientos_a_pacientes',
  MODIFY_TREATMENTS = 'modificar_tratamientos_asignados',
  VIEW_TREATMENT_HISTORY = 'ver_historial_de_tratamientos',
  ADD_DIAGNOSES = 'agregar_diagnosticos_medicos',
  EDIT_DIAGNOSES = 'editar_diagnosticos',

  // Reportes de Gestión
  VIEW_ACTIVITY_REPORTS = 'ver_reportes_de_actividad',
  GENERATE_CONSULTATION_REPORTS = 'generar_reportes_de_consultas_atendidas',
  GENERATE_ADHERENCE_REPORTS = 'generar_reportes_de_adherencia_al_tratamiento',
  DOWNLOAD_REPORTS = 'descargar_reportes_en_pdf_o_excel',

  // Administración y Configuración
  MANAGE_USERS = 'gestion_de_usuarios',
  CONFIGURE_USER_PERMISSIONS = 'configuracion_de_permisos_de_usuarios',
  DEFINE_STATISTICS_ACCESS = 'definir_acceso_a_estadisticas_y_reportes',
  CONFIGURE_ALERTS = 'configuracion_de_alertas_y_notificaciones',
  MANAGE_SPECIALTIES = 'gestion_de_especialidades_medicas',

  // Agenda y Turnos
  SCHEDULE_APPOINTMENTS = 'agendar_consultas_para_pacientes',
  EDIT_CANCEL_APPOINTMENTS = 'editar_y_cancelar_citas',
  CONFIRM_PATIENT_ATTENDANCE = 'confirmar_asistencia_del_paciente',
  BLOCK_SCHEDULE = 'bloquear_horarios_en_la_agenda',
  AUTOMATIC_REMINDERS = 'recordatorios_automaticos_de_citas',

  // Catálogos
  MANAGE_CATALOGS = 'gestionar_catalogos',
}
