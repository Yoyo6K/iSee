const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


exports.isAuthSocketMiddleware = async (socket, next) => {
  const req = socket.request;
  const res = req.res;

  // Ajoutez les propriétés `req` et `res` à l'objet `socket` pour y accéder ultérieurement
  socket.req = req;
  socket.res = res;

  try {
    // Votre logique d'authentification ici
    // Utilisez `req` et `res` comme vous le feriez normalement dans Express
    // Vous pouvez appeler votre fonction `checkAuthentication` ici

    // Exemple :
    const { isAuthenticated, error } = await checkAuthentication(req, res,"socket");

    if (isAuthenticated) {
      console.log("Authentication")
      return next();
    } else {
        return { error: error}
    }
  } catch (error) {
    console.log(error);
    return next(new Error(error));
  }
};




const checkAuthentication = async (req, res, responseType = "http") => {
  const { cookies, headers } = req;

  /* On vérifie que le JWT est présent dans les cookies de la requête */
  if (!cookies || !cookies.access_token) {
    return { isAuthenticated: false, error: "Missing token in cookie" };
    // return res.status(401).json({ message: 'Missing token in cookie' });
  }

  const accessToken = cookies.access_token;

  /* On vérifie que le token CSRF est présent dans les en-têtes de la requête */
  if (!headers || !headers["x-xsrf-token"]) {
    return { isAuthenticated: false, error: "Missing XSRF token in headers" };
    //return res.status(401).json({ message: 'Missing XSRF token in headers' });
  }

  const xsrfToken = headers["x-xsrf-token"];

  /* On vérifie et décode le JWT à l'aide du secret et de l'algorithme utilisé pour le générer */
  try {
    const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET, {
      algorithms: "HS256",
    });

    /* On vérifie que le token CSRF correspond à celui présent dans le JWT  */
    if (xsrfToken !== decodedToken.xsrfToken) {
      if (responseType =="http") {
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
      }
      return { isAuthenticated: false, error: "Bad xsrf token" };
      // return res.status(401).json({ message: "Bad xsrf token" });
    }
    const userId = decodedToken.sub;
    /* On vérifie que l'utilisateur existe bien dans notre base de données */

    const user = await User.findById(userId);
    if (!user) {
      if (responseType == "http") {
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
      }
      return { isAuthenticated: false, error: `User ${userId} not exists` };
      //  return res.status(401).json({ message: `User ${userId} not exists` });
    }

    if (!user.isValidated) {
      return { isAuthenticated: false, error: "Account not validated" };
      //return res.status(401).json({ message: "Account not validated" });
    }

    // Vérifiez si le token de rafraîchissement a expiré ou est sur le point d'expirer
    const refreshTokenExpired = user.expiresAt && Date.now() > user.expiresAt;
    const refreshTokenExpiringSoon =
      user.expiresAt && Date.now() > user.expiresAt - 19 * 60 * 1000; // 10 minutes avant l'expiration

    if (user.token !== cookies.refresh_token) {
      return { isAuthenticated: false, error: "Refresh token is not valid !" };
      // return res.status(401).json({ message: 'Refresh token is not valid !' });
    }



    if (refreshTokenExpired || refreshTokenExpiringSoon) {
    
    if (responseType == "http")
    {
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
    else 
    {
       return { isAuthenticated: false, error: "Refresh_token" };
    }




    }
    /* On passe l'utilisateur dans notre requête afin que celui-ci soit disponible pour les prochains middlewares */
    req.user = user;
    return { isAuthenticated: true };
  } catch (err) {
     if (responseType == "http")
      return res.status(500).json({ message: "Internal error" + err.message });
    else
      return { isAuthenticated: false, error: "Internal error" };
  }
};

exports.isAuth = async (req, res, next) => {
  const { isAuthenticated, error } = await checkAuthentication(req, res);

  if (!isAuthenticated) {
    return res.status(401).json({ message: error });
  }
  /* On appelle le prochain middleware */
  return next();
};

exports.checkAuthStatus = async (req, res, next) => {
  const { isAuthenticated } = await checkAuthentication(req, res);
  req.isAuthenticated = false;

  if (isAuthenticated) req.isAuthenticated = true;

  return next();
};

