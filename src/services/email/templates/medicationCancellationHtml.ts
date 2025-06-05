export const medicationCancellationHtml = (
  physicianName: string,
  patientName: string,
  medicationName: string,
  cancelReason: string,
  cancelDate: string,
) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Cancelación de Seguimiento de Medicación</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            .content {
                background-color: #ffffff;
                padding: 20px;
                border: 1px solid #dee2e6;
                border-radius: 8px;
            }
            .medication-details {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 5px;
                padding: 15px;
                margin: 15px 0;
            }
            .medication-details h3 {
                margin-top: 0;
                color: #856404;
            }
            ul {
                list-style-type: none;
                padding-left: 0;
            }
            li {
                margin: 8px 0;
                padding: 5px 0;
                border-bottom: 1px solid #eee;
            }
            .footer {
                margin-top: 30px;
                text-align: center;
                color: #666;
                font-size: 12px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h2 style="margin: 0; color: #495057;">Notificación Segimed - Cancelación de Seguimiento</h2>
        </div>
        
        <div class="content">
            <p>Estimado/a Dr./Dra. <strong>${physicianName}</strong>,</p>
            
            <p>Le informamos que el paciente <strong>${patientName}</strong> ha cancelado el seguimiento de una medicación que usted prescribió.</p>
            
            <div class="medication-details">
                <h3>Detalles de la Cancelación:</h3>
                <ul>
                    <li><strong>Medicación:</strong> ${medicationName}</li>
                    <li><strong>Paciente:</strong> ${patientName}</li>
                    <li><strong>Fecha de cancelación:</strong> ${cancelDate}</li>
                    <li><strong>Motivo:</strong> ${cancelReason || 'No especificado'}</li>
                </ul>
            </div>
            
            <p>Le recomendamos revisar el historial del paciente en la plataforma Segimed para evaluar si es necesario tomar alguna acción adicional o programar una consulta de seguimiento.</p>
            
            <p>Si tiene alguna duda o necesita más información, no dude en contactarnos.</p>
            
            <p>Atentamente,<br><strong>Equipo Segimed</strong></p>
        </div>
        
        <div class="footer">
            <p>Este es un mensaje automático del sistema Segimed. Por favor, no responda a este correo.</p>
        </div>
    </body>
    </html>
  `;
};
