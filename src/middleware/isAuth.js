const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

isAuth = async (req, res, next) => {
try {
    const { cookies, headers } = req;

    /* On vérifie que le JWT est présent dans les cookies de la requête */
    if (!cookies || !cookies.access_token) {
      return res.status(401).json({ message: 'Missing token in cookie' });
    }

    const accessToken = cookies.access_token;

    /* On vérifie que le token CSRF est présent dans les en-têtes de la requête */
    if (!headers || !headers['x-xsrf-token']) {
      return res.status(401).json({ message: 'Missing XSRF token in headers' });
    }

    const xsrfToken = headers['x-xsrf-token'];

    /* On vérifie et décode le JWT à l'aide du secret et de l'algorithme utilisé pour le générer */
    try {
      const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET, {
        algorithms: "HS256",
      });

      /* On vérifie que le token CSRF correspond à celui présent dans le JWT  */
      if (xsrfToken !== decodedToken.xsrfToken) {
        return res.status(401).json({ message: "Bad xsrf token" });
      }
      const userId = decodedToken.sub;
      /* On vérifie que l'utilisateur existe bien dans notre base de données */

      const user = await User.findById(userId);
      if (!user) {
        return res.status(401).json({ message: `User ${userId} not exists` });
      }
  
      // Vérifiez si le token de rafraîchissement a expiré ou est sur le point d'expirer
      const refreshTokenExpired = user.expiresAt && Date.now() > user.expiresAt;
      const refreshTokenExpiringSoon = user.expiresAt && Date.now() > user.expiresAt - 19 * 60 * 1000; // 10 minutes avant l'expiration

      if (user.token !== cookies.refresh_token) {
        return res.status(401).json({ message: 'Refresh token is not valid !' });
      }



        if (refreshTokenExpired || refreshTokenExpiringSoon) {
          // Générez un nouveau token de rafraîchissement
          const newRefreshToken = crypto.randomBytes(128).toString("base64");

          // Mettez à jour le token de rafraîchissement dans la base de données
          user.token = newRefreshToken;
          user.expiresAt = Date.now() + 20 * 60 * 1000; // 5 heures à partir de maintenant
          await user.save();

          res.cookie("refresh_token", newRefreshToken, {
            httpOnly: true,
            // secure: true,
            maxAge: 20 * 60 * 1000,
          });
        }
      /* On passe l'utilisateur dans notre requête afin que celui-ci soit disponible pour les prochains middlewares */
      req.user = user;

      /* On appelle le prochain middleware */
      return next();
    }catch(err) {
return res.status(500).json({ message: "Internal error" + err.message });
  }
    




  } catch (err) {
    return res.status(500).json({ message: 'Internal error' });
  }
}
  // console.log(req.headers.authorization);

  // if (req.headers.authorization) {
  //   const token = req.headers.authorization.split(" ")[1];
  //   try {
  //     const jwt_token = jwt.verify(token, process.env.JWT_SECRET);
  //     const user = await User.findById(jwt_token.id);

  //     console.log(jwt_token);
  //     console.log(user);

  //     if (!user) {
  //       return res.status(403).send("You dont have the permission");
  //     }

  //     req.user = user;
  //     next();
    //}
  //    catch (error) {
  //     return res.status(498).send("Token Invalid");
  //   }
  // };
//};

module.exports = isAuth;