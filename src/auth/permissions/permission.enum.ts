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

  // Gestión de Ordenes Médicas
  CREATE_MEDICAL_ORDERS = 'crear_ordenes_medicas',
  EDIT_MEDICAL_ORDERS = 'editar_ordenes_medicas',
  DELETE_MEDICAL_ORDERS = 'eliminar_ordenes_medicas',
  VIEW_MEDICAL_ORDERS = 'ver_ordenes_medicas',
  UPDATE_MEDICAL_ORDERS = 'actualizar_ordenes_medicas',

  // Catálogos
  MANAGE_CATALOGS = 'gestionar_catalogos',

  //Permisos de Paciente
  VIEW_OWN_APPOINTMENTS = 'ver_citas_propias',
  SCHEDULE_OWN_APPOINTMENT = 'agendar_citas_propias',
  VIEW_OWN_MEDICAL_RECORDS = 'ver_historial_medico_propio',
  SUBMIT_SELF_EVALUATION = 'enviar_evaluaciones_propias',
  VIEW_OWN_VITAL_SIGNS = 'ver_signos_vitales_propios',
  REGISTER_OWN_VITAL_SIGNS = 'registrar_signos_vitales_propios',
  VIEW_OWN_PRESCRIPTIONS = 'ver_prescripciones_propias',
  VIEW_OWN_MEDICAL_EVENTS = 'ver_eventos_medicos_propios',
}
