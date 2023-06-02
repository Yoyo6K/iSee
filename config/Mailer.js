function generateVerificationEmail(token) {
  return `<!DOCTYPE html>
         <html>
         <head>
           <meta charset="UTF-8">
           <title>Vérification de l'adresse e-mail</title>
         </head>
         <body>
           <h1>Vérification de l'adresse e-mail</h1>
           <p>Merci de vous être inscrit sur notre site. Avant de pouvoir accéder à votre compte, nous devons vérifier votre adresse e-mail.</p>
           <p>Veuillez cliquer sur le lien ci-dessous pour valider votre adresse e-mail :</p>
           <p><a href="https://iseevision.fr/verification?token=${token}">Valider mon adresse e-mail</a></p>
           <p>Si vous n'avez pas créé de compte sur notre site, veuillez ignorer cet e-mail.</p>
         </body>
         </html>`;
}

const emailConfig = {
  host: "smtp.ionos.fr",
  port: 465,
  auth: {
    user: "no-reply@iseevision.fr",
    pass: "5&g9G5u6:#dZDdC6sY{",
  },
  getHtml: (token) => generateVerificationEmail(token),
};

module.exports = emailConfig;
