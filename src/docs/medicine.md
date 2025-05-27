# Módulo de Medicinas

## Descripción

El módulo de medicinas proporciona funcionalidades para buscar y gestionar información sobre medicamentos. Permite a los desarrolladores interactuar con la API para obtener detalles de medicinas basadas en diversos criterios de búsqueda.

## Utilidad

Este módulo es esencial para cualquier funcionalidad dentro de la aplicación que requiera acceso a información de medicamentos, como la prescripción de medicinas, la consulta de interacciones medicamentosas, o la visualización de detalles de un medicamento específico.

## API Externa Consultada

El módulo de medicinas realiza consultas a la siguiente API externa para obtener información sobre los medicamentos:

- **URL Base:** `https://www.datos.gov.co/resource/i7cb-raxc.json`
- **Descripción:** Esta API proporciona datos abiertos sobre medicamentos registrados en Colombia, gestionada por el gobierno colombiano.

La integración con esta API permite al sistema acceder a una base de datos actualizada y oficial de medicamentos.

## Endpoints

A continuación, se detallan los endpoints disponibles en el módulo de medicinas:

### GET /medicine/searchMedicine

Busca medicamentos utilizando un texto que se aplica tanto al principio activo como al nombre del producto.

**Parámetros de Query:**

- `query` (string, requerido): Texto a buscar en el principio activo y nombre del producto.

**Ejemplo de Petición:**

```http
GET /medicine/searchMedicine?query=clon
```

**Respuesta Exitosa (200 OK):**

```json
[
  {
    "id": "EXP123456",
    "active_principle": "Clonazepam",
    "product": "Clonazepam Genfar",
    "presentation": "Tableta",
    "administration_route": "Oral",
    "quantity": "2",
    "measurement_unit": "mg"
  }
]
```

**Respuesta de Error (400 Bad Request):**

```json
{
  "statusCode": 400,
  "message": "El parámetro de búsqueda es requerido",
  "error": "Bad Request"
}
```

**Notas Adicionales:**

- El parámetro `query` es obligatorio y no puede estar vacío.
- La búsqueda se aplica a ambos campos: principio activo Y producto.
- La respuesta incluirá medicamentos que coincidan en cualquiera de los dos campos.
