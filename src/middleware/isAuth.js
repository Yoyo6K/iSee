const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const checkAuthentication = async (req, res, responseType = "http") => {
  const { cookies, headers } = req;

  /* On vérifie que le JWT est présent dans les cookies de la requête */
  if (!cookies || !cookies.access_token) {
    return {
      isAuthenticated: false,
      error: "Missing token in cookie",
      statusCode: 401,
    };
    // return res.status(401).json({ message: 'Missing token in cookie' });
  }

  const accessToken = cookies.access_token;

  /* On vérifie que le token CSRF est présent dans les en-têtes de la requête */
  if (!headers || !headers["x-xsrf-token"]) {
    return {
      isAuthenticated: false,
      error: "Missing XSRF token in headers",
      statusCode: 401,
    };
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
      if (responseType == "http") {
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
      }
      return {
        isAuthenticated: false,
        error: "Bad xsrf token",
        statusCode: 401,
      };
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
      return {
        isAuthenticated: false,
        error: `User ${userId} not exists`,
        statusCode: 404,
      };
      //  return res.status(401).json({ message: `User ${userId} not exists` });
    }

    if (!user.isValidated) {
      return {
        isAuthenticated: false,
        error: "Account not validated",
        statusCode: 401,
      };
      //return res.status(401).json({ message: "Account not validated" });
    }

    const dateActuelle = Date.now();
    const dateBanissement = new Date(user.banUntil).getTime();

    // Vérifier si l'utilisateur est banni
    if (user.banUntil && dateBanissement > dateActuelle) {
      const banissement = new Date(user.banUntil);

      if (responseType == "http") {
        res.clearCookie("access_token");
        res.clearCookie("refresh_token");
      }

      if (banissement.getFullYear() !== 9999) {
        const tempsRestant = dateBanissement - dateActuelle;
        const joursRestants = Math.floor(tempsRestant / (1000 * 60 * 60 * 24));
        const heuresRestantes = Math.floor(
          (tempsRestant % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutesRestantes = Math.floor(
          (tempsRestant % (1000 * 60 * 60)) / (1000 * 60)
        );
        const secondesRestantes = Math.floor(
          (tempsRestant % (1000 * 60)) / 1000
        );

        return {
          isAuthenticated: false,
          error: `You're banned for ${user.banReason}`,
          remainingTime: ` remaining time : ${joursRestants} days ${heuresRestantes} hours  ${minutesRestantes} minutes ${secondesRestantes} seconds`,
          statusCode: 403,
        };
      } else {
        return {
          isAuthenticated: false,
          error: `You're banned ${user.banReason}`,
          statusCode: 403,
        };
      }
    }

    // Vérifiez si le token de rafraîchissement a expiré ou est sur le point d'expirer
    const refreshTokenExpired = user.expiresAt && Date.now() > user.expiresAt;
    const refreshTokenExpiringSoon =
      user.expiresAt && Date.now() > user.expiresAt - 19 * 60 * 1000; // 10 minutes avant l'expiration

    if (user.token !== cookies.refresh_token) {
      return {
        isAuthenticated: false,
        error: "Refresh token is not valid !",
        statusCode: 401,
      };
      // return res.status(401).json({ message: 'Refresh token is not valid !' });
    }

    console.log(
      "Refresh tokenget validation",
      refreshTokenExpired,
      "\n",
      refreshTokenExpiringSoon
    );
    if (refreshTokenExpired || refreshTokenExpiringSoon) {
      console.log("refresh token is expired");
      if (responseType == "http") {
        // Générez un nouveau token de rafraîchissement
        const newRefreshToken = crypto.randomBytes(128).toString("base64");

        const old_refresh = user.token;
        // Mettez à jour le token de rafraîchissement dans la base de données
        user.token = newRefreshToken;
        user.expiresAt = Date.now() + 2 * 60 * 60 * 1000; //  3 heures en millisecondes
        await user.save();
        console.log(
          "new refresh token ",
          newRefreshToken,
          "\nold",
          cookies.refresh_token,
          "\nuser oold ",
          old_refresh
        );
        const isDevelopment = process.env.NODE_ENV === "development";
        res.cookie("refresh_token", newRefreshToken, {
          httpOnly: true,
          secure: isDevelopment ? false : true,
          maxAge: 2 * 60 * 60 * 1000, // 3 heures en millisecondes,
        });
      } else {
        return {
          isAuthenticated: false,
          error: "Refresh_token",
          statusCode: 401,
        };
      }
    }
    /* On passe l'utilisateur dans notre requête afin que celui-ci soit disponible pour les prochains middlewares */
    req.user = user;
    return { isAuthenticated: true };
  } catch (err) {
    return {
      isAuthenticated: false,
      error: "Internal error",
      statusCode: 500,
    };
  }
};

exports.isAuth = async (req, res, next) => {
  try {
    const { isAuthenticated, error, remainingTime, statusCode } =
      await checkAuthentication(req, res);

    console.log("isAuthenticated", isAuthenticated);
    if (!isAuthenticated) {
      let message = `${error}`;
      if (remainingTime) {
        message = `${message} ${remainingTime}`;
      }
      res.status(statusCode).json({ error: message });
    } else {
      /* On appelle le prochain middleware */
      return next();
    }
  } catch (e) {
    console.error(e);
  }
};

exports.checkAuthStatus = async (req, res, next) => {
  const { isAuthenticated, error, remainingTime, statusCode } =
    await checkAuthentication(req, res);
  req.isAuthenticated = false;
  let message = `${error}`;
  if (message.includes("You're banned")) {
    if (remainingTime) {
      message = `${message} ${remainingTime}`;
    }

    req.error = { error: `${message}`, statusCode: statusCode };
  }
  if (isAuthenticated) req.isAuthenticated = true;

  return next();
};

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
    const { isAuthenticated, error, remainingTime, statusCode } =
      await checkAuthentication(req, res, "socket");

    if (isAuthenticated) {
      return { message: "Authenticated" };
    } else {
      let message = `${error}`;
      if (remainingTime) {
        message = `${message} ${remainingTime}`;
      }
      return {
        error: message,
        remainingTime: remainingTime,
        statusCode: statusCode,
      };
    }
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};
