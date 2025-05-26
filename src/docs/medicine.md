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

### POST /medicine/searchMedicine

Busca medicinas basadas en el principio activo y el nombre del producto.

**Parámetros de Query:**

- `drug` (string, opcional): El principio activo del medicamento a buscar.
- `product` (string, opcional): El nombre del producto del medicamento a buscar.

**Ejemplo de Petición:**

```http
POST /medicine/searchMedicine?drug=Amoxicilina&product=Amoxidal
```

**Respuesta Exitosa (200 OK):**

```json
[
  {
    "id": 1,
    "principioActivo": "Amoxicilina",
    "producto": "Amoxidal",
    "presentacion": "500mg",
    "laboratorio": "Roemmers"
    // ... otros campos relevantes
  }
]
```

**Respuesta de Error (ej. 400 Bad Request):**

```json
{
  "statusCode": 400,
  "message": "Parámetros de búsqueda inválidos",
  "error": "Bad Request"
}
```

**Notas Adicionales:**

- Al menos uno de los parámetros de query (`drug` o `product`) debe ser proporcionado.
- La respuesta incluirá un arreglo de objetos, donde cada objeto representa un medicamento que coincide con los criterios de búsqueda.
