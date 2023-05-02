const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

isAuth = async (req, res, next) => {
  try {

    const {cookies, headers} = req;

    if(!cookies || cookies.access_token)
    {
      return res.status(400).send("Missing token in cookies");
    }

    const accessToken = cokiie.accessToken;

    // On verifie que le token CRSF est présent dans les en-têtes de la requête

    if(!headers || headers['x-xsrf-token'])
    {
      return res.status(401).send("Missing xsrf token in headers");
    }
    const xsrfToken = headers['x-xsrf-token'];

    const decodedToken = jwt.verify(accessToken, process.env.JWT_SECRET, {
      algorithms: 'RS256'
    });

    if (xsrfToken !== decodedToken.xsrfToken) {
      return res.status(401).send("Invalid xsrf token");
  }
          const user = await User.findById(decodedToken.sub);
        if (!user) {
        return res.status(403).send("You dont have the permission");
      }
     req.user = user;
     next();
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
     catch (error) {
      return res.status(498).send("Token Invalid");
    }
  };
//};

module.exports = isAuth;