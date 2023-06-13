function generateVerificationEmail(token, username) {
  return `<!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Email Address Verification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f9f9f9;
        padding: 20px;
      }
      h1 {
        color: #333333;
        font-size: 24px;
      }
      p {
        color: #666666;
        font-size: 16px;
      }
      a {
        color: #ffffff;
        background-color: #007bff;
        border-radius: 5px;
        padding: 10px 20px;
        text-decoration: none;
      }
      a:hover {
        background-color: #0099ff;
      }
      .username {
        color: #007bff;
      }
    </style>
  </head>
  <body>
    <h1>Email Address Verification</h1>
    <p>Thank you for signing up on our website <span class="username">${username}</span> ! Before you can access your account, we need to verify your email address.</p>
    <p>Please click on the link below to validate your email address:</p><br/>
    <p><a href="https://iseevision.fr/verification?token=${token}">Verify my Account</a></p><br/>
    <p>If you didn't create an account on our website, please ignore this email.</p>
    <p>iSee</p>
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
  getHtml: (token, username) => generateVerificationEmail(token, username),
};

module.exports = emailConfig;
