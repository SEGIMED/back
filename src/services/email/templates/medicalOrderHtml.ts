export const medicalOrderHtml = (
  patientName: string,
  patientLastName: string,
  orderType: string,
  orderDate: string,
  physicianName: string,
  description?: string,
  url?: string,
): string => {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta
      name="viewport"
      content="width=device-width,initial-scale=1,maximum-scale=2,shrink-to-fit=no" />
    <title>Nueva Orden Médica</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      body {
        font-family: "Poppins", sans-serif;
        background-color: #fafafc;
        margin: 0;
        padding: 0;
        width: 600px;
      }
      .container {
        width: 100%;
        padding: 20px 0;
        text-align: center;
        background-color: #fafafc;
      }
      .email-content {
        width: 90%;
        padding: 0 15px;
        max-width: 600px;
        margin: 0 auto;
        background-color: #fff;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      }
      .logo-container {
        padding: 20px 0;
      }
      .logo-container img {
        display: block;
        margin: 0 auto;
        width: 180px;
      }
      .content {
        padding: 45px 0 20px 0;
        text-align: center;
        color: #808080;
        font-size: 16px;
        width: 100%;
        margin: 0 auto;
      }
      .content h1 {
        font-size: 32px;
        color: #487ffa;
        font-weight: 500;
        margin-bottom: 30px;
      }
      .content p {
        margin-bottom: 20px;
      }
      .detail-list {
        text-align: left;
        margin: 20px auto;
        width: 80%;
      }
      .detail-list li {
        padding: 10px 0;
        border-bottom: 1px solid #eee;
      }
      .footer {
        padding: 40px 0;
        font-size: 14px;
        color: #808080;
        width: 60%;
        margin: 0 auto;
        text-align: center;
      }
      @media only screen and (max-width: 600px) {
        body {
          width: 90%;
        }
        .email-content {
          width: 100% !important;
          box-shadow: none;
        }
        .logo-container img {
          width: 150px;
        }
        .content {
          padding: 30px 10px 10px 10px;
          font-size: 18px;
          width: 100%;
        }
        .content h1 {
          font-size: 28px;
        }
        .detail-list {
          width: 90%;
        }
        .footer {
          padding: 20px 0;
          font-size: 12px;
          width: 100%;
        }
      }
    </style>
  </head>
  <body>
    <table class="container" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td align="center" class="logo-container">
          <img
            src="https://res.cloudinary.com/dya1ekkd5/image/upload/v1721930541/oidzxqlccwuewq2daqoa.png"
            alt="Logo" />
        </td>
      </tr>
      <tr>
        <td align="center">
          <table
            class="email-content"
            cellpadding="0"
            cellspacing="0"
            width="100%">
            <tr>
              <td class="content">
                <h1>Nueva Orden Médica</h1>
                <p>Estimado/a ${patientName} ${patientLastName || ''},</p>
                <p>Se ha generado una nueva orden médica de tipo <strong>${orderType}</strong> para usted.</p>
                <div class="detail-list">
                  <ul>
                    <li><strong>Fecha de solicitud:</strong> ${orderDate}</li>
                    <li><strong>Médico:</strong> ${physicianName || 'No especificado'}</li>
                    ${description ? `<li><strong>Descripción:</strong> ${description}</li>` : ''}
                    ${url ? `<li><strong>Puede descargar su orden:</strong> <a href="${url}">aquí</a></li>` : ''}
                  </ul>
                </div>
                <p>Si tiene alguna pregunta o requiere más información, por favor contacte a su médico.</p>
              </td>
            </tr>
            <tr>
              <td class="footer">
                <p>Este es un mensaje automático, por favor no responda a este correo.</p>
                <p>© ${new Date().getFullYear()} SEGIMED - Sistema de Gestión Médica</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};
