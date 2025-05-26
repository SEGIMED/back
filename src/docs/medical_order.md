# Documentación API de Órdenes Médicas

## Descripción General

La API de Órdenes Médicas proporciona endpoints para gestionar varios tipos de órdenes médicas, incluyendo recetas, autorizaciones de estudios, certificados, solicitudes de hospitalización y solicitudes de turnos.

## Autenticación

Todos los endpoints requieren autenticación mediante token Bearer y los permisos apropiados.

## URL Base

`/medical-order`

## Tipos de Órdenes Médicas

El sistema soporta los siguientes tipos de órdenes médicas:

1. **Autorización de Estudio (`study-authorization`)**

   - Para solicitar estudios médicos como resonancias magnéticas, tomografías, etc.
   - Requiere tipo de estudio y motivo
   - Puede incluir documentos de respaldo

2. **Certificado (`certification`)**

   - Certificados médicos para ausencia laboral, aptitud deportiva, etc.
   - Tipos estándar o personalizados
   - Requiere categoría de diagnóstico CIE-10

3. **Solicitud de Hospitalización (`hospitalization-request`)**

   - Para programar cirugías o tratamientos planificados
   - Requiere motivo de hospitalización y diagnóstico CIE-10
   - Puede incluir documentación adicional

4. **Solicitud de Turno (`appointment-request`)**

   - Para derivaciones a especialistas
   - Requiere especialidad médica y diagnóstico CIE-10
   - Puede incluir motivo de la derivación

5. **Medicación (`medication`)**

   - Para prescribir medicamentos
   - Múltiples medicamentos por orden
   - Incluye dosificación, frecuencia y duración

6. **Autorización de Medicación (`medication-authorization`)**
   - Para autorizar uso de medicación crónica
   - Similar a las órdenes de medicación regulares
   - Usualmente para duraciones más largas

## Endpoints

### 1. Crear Orden Médica

Crea una nueva orden médica en el sistema.

**Endpoint:** `POST /medical-order`

**Parámetros de Consulta:**

- `type` (requerido): Tipo de orden médica. Valores posibles:
  - `study-authorization`
  - `certification`
  - `hospitalization-request`
  - `appointment-request`
  - `medication`
  - `medication-authorization`

**Permiso Requerido:** `CREATE_MEDICAL_ORDERS`

**Ejemplos de Solicitudes:**

1. Autorización de Estudio:

```json
{
  "patient_id": "123e4567-e89b-12d3-a456-426614174000",
  "cat_study_type_id": 1,
  "request_reason": "Se requiere resonancia magnética para evaluar lesión en rodilla",
  "description_type": "Resonancia Magnética de Rodilla",
  "application_date": "2023-12-01T10:00:00Z",
  "file": "data:application/pdf;base64,JVBERi0xLjUNJeLjz9..."
}
```

2. Prescripción de Medicamentos:

```json
{
  "patient_id": "123e4567-e89b-12d3-a456-426614174000",
  "description_type": "Receta médica para control de dolor",
  "medications": [
    {
      "monodrug": "Paracetamol",
      "dose": "500",
      "dose_units": "mg",
      "frecuency": "Cada 8 horas",
      "duration": "7",
      "duration_units": "días",
      "observations": "Tomar con alimentos"
    },
    {
      "monodrug": "Ibuprofeno",
      "dose": "400",
      "dose_units": "mg",
      "frecuency": "Cada 12 horas",
      "duration": "5",
      "duration_units": "días",
      "observations": "Tomar después de las comidas para evitar irritación estomacal"
    }
  ]
}
```

3. Solicitud de Hospitalización:

```json
{
  "patient_id": "123e4567-e89b-12d3-a456-426614174000",
  "category_cie_diez_id": 78,
  "hospitalization_reason": "Paciente requiere intervención quirúrgica programada",
  "request_reason": "Hernia discal que requiere cirugía",
  "description_type": "Internación para cirugía de columna",
  "application_date": "2023-12-01T10:00:00Z"
}
```

4. Solicitud de Turno:

```json
{
  "patient_id": "123e4567-e89b-12d3-a456-426614174000",
  "cat_speciality_id": 3,
  "category_cie_diez_id": 52,
  "description_type": "Derivación a traumatología por dolor en rodilla",
  "application_date": "2023-12-01T10:00:00Z"
}
```

**Respuesta Exitosa (201):**

```json
{
  "message": "Se ha creado correctamente la orden médica",
  "order_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

### 2. Obtener Todas las Órdenes Médicas

Recupera todas las órdenes médicas con paginación.

**Endpoint:** `GET /medical-order`

**Parámetros de Consulta:**

- `page` (opcional): Número de página para paginación
- `limit` (opcional): Número de elementos por página
- `type` (opcional): Filtrar por tipo de orden
- `patient_id` (opcional): Filtrar por ID de paciente

**Permiso Requerido:** `VIEW_MEDICAL_ORDERS`

**Respuesta Exitosa (200):**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "url": "https://example.com/orders/123",
      "request_date": "2023-12-01T14:30:00Z",
      "organization_name": "Hospital General",
      "physician_name": "Dr. Juan Pérez",
      "patient_name": "María García",
      "order_type": "Prescripción"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

### 3. Obtener Órdenes Médicas del Médico

Recupera todas las órdenes médicas de un médico específico con paginación.

**Endpoint:** `GET /medical-order/physician`

**Parámetros de Consulta:**

- `page` (opcional): Número de página para paginación
- `limit` (opcional): Número de elementos por página
- `patient_id` (opcional): Filtrar por ID de paciente
- `type` (opcional): Filtrar por tipo de orden

**Permiso Requerido:** `VIEW_MEDICAL_ORDERS`

**Respuesta Exitosa (200):**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "url": "https://example.com/orders/123",
      "request_date": "2023-12-01T14:30:00Z",
      "organization_name": "Hospital General",
      "physician_name": "Dr. Juan Pérez",
      "patient_name": "María García",
      "order_type": "Prescripción"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

### 4. Obtener Órdenes Médicas del Paciente

Recupera todas las órdenes médicas de un paciente específico con paginación.

**Endpoint:** `GET /medical-order/patient`

**Parámetros de Consulta:**

- `page` (opcional): Número de página para paginación
- `limit` (opcional): Número de elementos por página
- `physician_id` (opcional): Filtrar por ID del médico
- `type` (opcional): Filtrar por tipo de orden
- `tenant_id` (opcional): Filtrar por ID del tenant

**Permiso Requerido:** `VIEW_MEDICAL_ORDERS`

**Respuesta Exitosa (200):**

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "url": "https://example.com/orders/123",
      "request_date": "2023-12-01T14:30:00Z",
      "organization_name": "Hospital General",
      "physician_name": "Dr. Juan Pérez",
      "order_type": "Prescripción",
      "tenant_id": "123e4567-e89b-12d3-a456-426614174001"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

### 5. Obtener Orden Médica Específica

Recupera una orden médica específica por ID.

**Endpoint:** `GET /medical-order/:id`

**Permiso Requerido:** `VIEW_MEDICAL_ORDERS`

**Respuesta Exitosa (200):**

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "url": "https://example.com/orders/123",
  "request_date": "2023-12-01T14:30:00Z",
  "organization_name": "Hospital General",
  "physician_name": "Dr. Juan Pérez",
  "patient_name": "María García",
  "order_type": "Prescripción"
}
```

### 6. Actualizar Orden Médica

Actualiza una orden médica específica por ID.

**Endpoint:** `PATCH /medical-order/:id`

**Permiso Requerido:** `UPDATE_MEDICAL_ORDERS`

**Cuerpo de la Solicitud:**

```json
{
  "file": "data:application/pdf;base64,JVBERi0xLjUNJeLjz9..."
}
```

**Respuesta Exitosa (200):**

```json
{
  "message": "Orden médica actualizada correctamente"
}
```

### 7. Eliminar Orden Médica

Elimina una orden médica específica por ID.

**Endpoint:** `DELETE /medical-order/:id`

**Permiso Requerido:** `DELETE_MEDICAL_ORDERS`

**Respuesta Exitosa (200):**

```json
{
  "message": "Orden médica eliminada correctamente"
}
```

## Respuestas de Error

### 400 Solicitud Incorrecta

```json
{
  "message": "Datos de solicitud inválidos",
  "error": "Bad Request"
}
```

### 403 Prohibido

```json
{
  "message": "Permisos insuficientes",
  "error": "Forbidden"
}
```

### 404 No Encontrado

```json
{
  "message": "Orden médica no encontrada",
  "error": "Not Found"
}
```

## Tipos de Respuesta

### Respuesta Base de Orden Médica

```typescript
{
  id: string; // Identificador único de la orden médica
  url: string; // URL para acceder a la orden médica
  request_date: Date; // Fecha en que se solicitó la orden
  organization_name: string; // Nombre de la organización que proporciona la orden
  physician_name: string; // Nombre completo del médico que creó la orden
}
```

## Archivos y Documentos

### Formatos de Archivo Soportados

- Documentos PDF (application/pdf)
- Imágenes (image/jpeg, image/png)
- Tamaño máximo de archivo: 5MB

### Formato de Carga de Archivos

Los archivos deben enviarse como data URIs codificados en base64 en el siguiente formato:

```
data:[<mediatype>];base64,<data>
```

Ejemplo:

```json
{
  "file": "data:application/pdf;base64,JVBERi0xLjUNJeLjz9..."
}
```

## Detalles de Medicación

### Campos de Medicamento

- `monodrug` (string, requerido): Nombre genérico del medicamento
- `dose` (string, requerido): Cantidad de medicamento por dosis
- `dose_units` (string, requerido): Unidades para la dosis (mg, ml, etc.)
- `frecuency` (string, requerido): Frecuencia de administración
- `duration` (string, requerido): Duración del tratamiento
- `duration_units` (string, requerido): Unidades para la duración (días, semanas, etc.)
- `observations` (string, opcional): Instrucciones adicionales
- `authorized` (boolean, opcional): Indica si el medicamento está pre-autorizado

### Unidades de Duración Comunes

- "días" (days)
- "semanas" (weeks)
- "meses" (months)

### Unidades de Dosis Comunes

- "mg" (milligrams)
- "ml" (milliliters)
- "gotas" (drops)
- "unidades" (units)

### Frecuencias Comunes

- "Cada 8 horas" (Every 8 hours)
- "Cada 12 horas" (Every 12 hours)
- "Una vez al día" (Once a day)
- "Cada 24 horas" (Every 24 hours)
- "Dos veces al día" (Twice a day)
