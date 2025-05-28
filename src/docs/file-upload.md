# Documentación de API: File Upload

Este documento proporciona detalles sobre los endpoints del módulo de File Upload (Carga de Archivos) disponibles en la API de Segimed.

## Información General

- **Base URL**: `/files`
- **Controlador**: `FileUploadController`
- **Servicios Relacionados**: `FileUploadService`, `FileUploadRepository`
- **Servicio de Almacenamiento**: Cloudinary

## Descripción del Módulo

El módulo File Upload permite a los usuarios cargar archivos (imágenes y documentos PDF) al servidor. Estos archivos son almacenados en Cloudinary, un servicio de gestión de activos en la nube, y la API devuelve la URL y el tipo de archivo cargado.

## Limitaciones y Validaciones

- **Tipos de archivo permitidos**:
  - Imágenes: jpg, jpeg, png, webp, svg
  - Documentos: pdf
- **Tamaño máximo de archivo**:
  - 10MB para documentos PDF
  - 5MB para imágenes (aunque la validación actual es de 10MB para todos los tipos)

## Endpoints

### 1. Subir Archivo

Permite cargar un archivo (imagen o PDF) al servidor.

- **URL**: `POST /files/upload`
- **Content-Type**: `multipart/form-data`
- **Body**:
  - `file`: El archivo a cargar (campo binario)
- **Respuestas**:
  - `200 OK`: Archivo subido correctamente
    ```json
    {
      "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/sample.jpg",
      "type": "image"
    }
    ```
  - `400 Bad Request`: Archivo inválido o excede el tamaño máximo permitido
  - `500 Internal Server Error`: Error al procesar la carga del archivo

## Funcionalidades Adicionales del Servicio

Aunque no están expuestas como endpoints API, el servicio también proporciona las siguientes funcionalidades:

### Carga de Archivos Base64

El servicio `FileUploadService` incluye un método para cargar archivos desde una cadena en formato base64:

```typescript
async uploadBase64File(
  dataUri: string,
  filename?: string,
): Promise<{ url: string; type: string }>
```

Este método es utilizado internamente por otros módulos cuando necesitan cargar archivos que ya están en formato base64.

## Configuración del Servicio

El módulo utiliza Cloudinary como servicio de almacenamiento. La configuración se obtiene de las siguientes variables de entorno:

- `CLOUDINARY_CLOUD_NAME`: Nombre de la nube en Cloudinary
- `CLOUDINARY_API_KEY`: Clave de API de Cloudinary
- `CLOUDINARY_API_SECRET`: Secreto de API de Cloudinary

## Ejemplos de Uso

### Carga de archivo desde el cliente

```javascript
// Ejemplo con Fetch API
const formData = new FormData();
const fileInput = document.querySelector('input[type="file"]');
formData.append('file', fileInput.files[0]);

fetch('https://api.segimed.com/files/upload', {
  method: 'POST',
  body: formData,
  // Incluir headers de autenticación si son necesarios
})
  .then((response) => response.json())
  .then((data) => {
    console.log('URL del archivo:', data.url);
    console.log('Tipo de archivo:', data.type);
  })
  .catch((error) => console.error('Error al subir el archivo:', error));
```

## Consideraciones de Seguridad

- El servicio valida el tipo y tamaño de los archivos antes de procesarlos.
- Actualmente no hay restricciones de autenticación para este endpoint, lo que podría ser un riesgo de seguridad. Es recomendable:
  - Añadir autenticación (Bearer JWT).
  - Implementar limitación de tasa (rate limiting).
  - Considerar escanear los archivos en busca de virus o contenido malicioso antes de procesarlos.

## Recomendaciones para Mejoras Futuras

1. Añadir autenticación y autorización al endpoint de carga de archivos.
2. Implementar un endpoint para eliminar archivos previamente cargados.
3. Añadir soporte para más tipos de archivos según las necesidades de la aplicación.
4. Implementar mejor manejo de errores y validaciones más específicas para cada tipo de archivo.
5. Considerar añadir metadatos a los archivos cargados para facilitar su gestión y búsqueda.
