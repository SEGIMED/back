export const medicationHtml = (
  patientName: string,
  patientLastName: string,
  medications: any[],
  physicianName: string,
): string => {
  // Generar lista de medicamentos HTML
  const medicationListHtml = medications
    .map(
      (med) => `
    <li style="padding: 10px 0; border-bottom: 1px solid #eee;">
      <strong>${med.monodrug}:</strong> ${med.dose} ${med.dose_units}, ${med.frecuency}, por ${med.duration} ${med.duration_units}${
        med.observations
          ? `<br><span style="font-style: italic; color: #666;">Observaciones: ${med.observations}</span>`
          : ''
      }
    </li>
  `,
    )
    .join('');

  return `<!DOCTYPE html>
<html>
  <head>
    <meta
      name="viewport"
      content="width=device-width,initial-scale=1,maximum-scale=2,shrink-to-fit=no" />
    <title>Medicaciones Prescritas</title>
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
      .medications-list {
        text-align: left;
        margin: 20px auto;
        width: 80%;
        list-style-type: none;
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
        .medications-list {
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
                <h1>Medicaciones Prescritas</h1>
                <p>Estimado/a ${patientName} ${patientLastName || ''},</p>
                <p>Durante su consulta, el Dr./Dra. ${
                  physicianName || 'su médico'
                } ha prescrito las siguientes medicaciones:</p>
                <ul class="medications-list">
                  ${medicationListHtml}
                </ul>
                <p>Por favor, siga las indicaciones de su médico y tome sus medicamentos según lo prescrito.</p>
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
