const welcomeEmailHtml = (name: string): string => {
  return `<!DOCTYPE html>
  <html>
    <head>
      <title>Confirmar email</title>
      <meta
        name="viewport"
        content="width=device-width,initial-scale=1,maximum-scale=2,shrink-to-fit=no" />
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
          padding: 35px 0 10px 0;
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
          margin-bottom: 10px;
        }
        .content h2 {
          font-size: 42px;
          color: #487ffa;
          font-weight: 500;
        }
        .content p {
          margin-bottom: 20px;
        }
        .body {
          text-align: center;
          color: #808080;
          font-size: 20px;
          width: 60%;
        }
        .body p {
          margin-bottom: 20px;
        }
        .footer {
          padding: 10px 0 20px 0;
          font-size: 20px;
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
            padding: 20px 10px 10px 10px;
            font-size: 18px;
            width: 100%;
          }
          .content h1 {
            font-size: 28px;
          }
          .body {
            padding-top: 10px;
            padding-bottom: 25px;
          }
          .footer {
            padding: 20px 0;
            font-size: 20px;
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
                  <h1>¡Bienvenido a Segimed!</h1>
                </td>
              </tr>
              <tr>
                <td class="body">
                  <p>Hola ${name},</p>
                  <p>
                    ¡Nos alegra mucho darte la bienvenida a Segimed! Estamos
                    encantados de que te unas a nosotros.
                  </p>
                  <p>
                    En Segimed, nos esforzamos por ofrecerte la mejor experiencia
                    posible. Si tenes alguna pregunta o necesitas ayuda, no dudes
                    en ponerte en contacto con nuestro equipo de soporte. Estamos
                    para ayudarte en cada paso.
                  </p>
                </td>
              </tr>
              <tr>
                <td class="footer">
                  <p>-El equipo de Segimed.</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
};

export default welcomeEmailHtml;
