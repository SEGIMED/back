# Mejoras para el Backend - API de Consultas

Hola equipo de backend,

Para poder mostrar correctamente la información de las consultas en el frontend, necesitamos realizar algunos ajustes en el endpoint `/appointments/user`.

## 1. Estructura de Respuesta Paginada

Actualmente, el endpoint `/appointments/user` devuelve un array de consultas. Para implementar la paginación correctamente en el frontend, necesitamos que la respuesta tenga una estructura que incluya tanto la lista de consultas de la página actual como el número total de consultas.

**Endpoint:** `GET /appointments/user`

**Respuesta Actual:**
```json
[
  { ...consulta 1... },
  { ...consulta 2... },
  ...
]
```

**Respuesta Sugerida:**
```json
{
  "data": [
    { ...consulta 1... },
    { ...consulta 2... },
    ...
  ],
  "total": 12
}
```
Donde `data` es el array de consultas para la página solicitada y `total` es el número total de consultas que coinciden con la solicitud. Esto es similar a como funciona el endpoint de pacientes y nos permitirá mostrar la paginación correctamente.

## 2. Incluir Datos del Paciente en la Respuesta

La respuesta actual para cada consulta incluye `patient_id`, pero no el nombre del paciente. Para evitar tener que hacer una solicitud adicional por cada consulta para obtener el nombre del paciente, por favor incluyan los datos del paciente directamente en la respuesta.

**Endpoint:** `GET /appointments/user`

**Objeto de consulta actual en la respuesta:**
```json
{
  "id": "10920462-72c2-47e7-9d60-c1af00663b33",
  "patient_id": "92db6b6a-5b43-4184-b7f7-8fdff8141dea",
  ...
}
```

**Objeto de consulta sugerido en la respuesta (dentro de `data`):**
```json
{
  "id": "10920462-72c2-47e7-9d60-c1af00663b33",
  "patient_id": "92db6b6a-5b43-4184-b7f7-8fdff8141dea",
  ...,
  "patient": {
    "name": "Nombre del Paciente",
    "last_name": "Apellido del Paciente"
  }
}
```
Esto nos permitirá mostrar el nombre completo del paciente en la lista de consultas.

Estos cambios mejorarán significativamente la experiencia del usuario y la eficiencia del frontend.

## 4. Ordenamiento en la API

Para que el ordenamiento de las consultas funcione correctamente, necesitamos que la API se encargue de ordenar los resultados. Esto es especialmente importante para el ordenamiento por fecha, ya que el frontend solo tiene acceso a los datos de la página actual.

**Endpoint:** `GET /appointments/user`

**Parámetros de Query Sugeridos:**
*   `sortBy` (string): El campo por el que se debe ordenar (por ejemplo, `consultationDate`).
*   `sortDirection` (string): La dirección del ordenamiento (`asc` o `desc`).

**Ejemplo de Solicitud:**
`GET /appointments/user?sortBy=consultationDate&sortDirection=desc`

Esto nos permitirá implementar un ordenamiento eficiente y preciso en el frontend.

¡Gracias!
