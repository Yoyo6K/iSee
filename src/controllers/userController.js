const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/userModel");
const nodemailer = require("nodemailer");
const emailConfig = require("../../config/Mailer");
require("dotenv").config();

// Vérification si l'environment est en developpement
const isDevelopment = process.env.NODE_ENV === "development";

const {
  validateLogin,
  validateRegister,
  validateUpdate,
} = require("../middleware/validator");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ error: "Error fetching all users" });
  }
};

exports.channelUsers = async (req, res) => {
  const isAuthenticated = req.isAuthenticated;
  const { channelName } = req.params;

  const username = channelName;

  try {
    if (isAuthenticated && req.user.username === username) {
      const { _id, username, logo_path, banner_path } = req.user;
      res.status(200).send({
        id: _id,
        username: username,
        logo: logo_path,
        banner: banner_path,
      });
    } else {
      const channelUserInformation = await User.findOne({ username: username });
      if (channelUserInformation) {
        res.status(200).send({
          id: channelUserInformation._id,
          username: channelUserInformation.username,
          logo: channelUserInformation.logo_path,
          banner: channelUserInformation.banner_path,
        });
      } else res.status(404).send({ message: "User channel not found" });
    }
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

exports.refreshToken = async (req, res) => {
 try {
   const isAuthenticated = req.isAuthenticated;


 } catch (error) {
   res.status(500).send({ message: "Internal Server Error" });
 }

};

exports.profileUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-_id -isValidated -createdAt -updatedAt -__v"
    );
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ error: "Error fetching user profile" });
  }
};

exports.loginUsers = async (req, res) => {
  // Joi Validation
  const { error } = validateLogin(req.body);

  if (error) {
    console.log(error);
    return res.status(400).send(error.details[0].message);
  }

  // Recherchez l'utilisateur dans la base de données en utilisant l'e-mail envoyé dans la requête
  User.findOne({ email: req.body.email }, async (err, user) => {
    try {
      if (err) {
        res.status(500).send(err);
      } else if (!user) {
        res.status(401).send({ message: "Incorrect email or password" });
      } else {
        if (!user.isValidated) {
          return res.status(401).json({ message: "Account not validated" });
        }

        // Vérifiez si le mot de passe envoyé dans la requête correspond au mot de passe hashé de l'utilisateur
        bcrypt.compare(
          req.body.password,
          user.password,
          async (err, result) => {
            if (err) {
              res.status(500).send(err);
            } else if (!result) {
              res.status(401).send({ message: "Incorrect email or password" });
            } else {
              /* On créer le token CSRF */
              const xsrfToken = crypto.randomBytes(64).toString("hex");

              // Générez un jeton JWT pour l'utilisateur
              const token = jwt.sign(
                {
                  id: user._id,
                  username: user.username,
                  email: user.email,
                  isAdmin: user.isAdmin,
                  xsrfToken: xsrfToken,
                },
                process.env.JWT_SECRET,
                {
                  expiresIn: "1h",
                  algorithm: "HS256",
                  subject: user._id.toString(),
                }
              );

              const refreshToken = crypto.randomBytes(128).toString("base64");

              await User.findByIdAndUpdate(user._id, {
                token: refreshToken,
                expiresAt: Date.now() + 20 * 60 * 1000,
              });

              res.cookie("access_token", token, {
                httpOnly: true,
                secure: isDevelopment ? false : true,
                maxAge: 60 * 60 * 1000,
              });

              /* On créer le cookie contenant le refresh token */
              res.cookie("refresh_token", refreshToken, {
                httpOnly: true,
                secure: isDevelopment ? false : true,
                maxAge: 20 * 60 * 1000,
              });
              res.send({
                xsrfToken: xsrfToken,
                user: {
                  id: user._id,
                  username: user.username,
                  email: user.email,
                  isAdmin: user.isAdmin,
                  isValidated: user.isValidated,
                  logo: user.logo_path,
                  banner: user.banner_path,
                  expiresAt: user.expiresAt,
                },
              });
            }
          }
        );
      }
    } catch (err) {
      return res.status(500).send("Internal Server Error");
    }
  });
};

exports.registerUsers = async (req, res) => {
  const { error } = validateRegister(req.body);

  if (error) {
    console.log(error);
    return res.send(error.details);
  }

  // Vérifiez si l'adresse e-mail est déjà utilisée
  User.findOne({ email: req.body.email }, async (err, user) => {
    if (err) {
      res.status(500).send(err);
    } else if (user) {
      res.status(400).send({ message: "This email address is already in use" });
    } else {
      // Hash le mot de passe de l'utilisateur
      bcrypt.hash(req.body.password, 10, async (err, hash) => {
        if (err) {
          res.status(500).send(err);
        } else {
          // Créez un nouvel utilisateur avec les données envoyées dans la requête et le mot de passe hashé
          const newUser = new User({
            id: req.body.id,
            username: req.body.username,
            email: req.body.email,
            password: hash,
            isAdmin: req.body.isAdmin,
            token: null,
            expiresAt: null,
            isValidated: false,
          });
          if (
            req.files &&
            req.files["logo"] &&
            req.files["logo"][0]?.path !== undefined
          ) {
            newUser.logo_path = req.files["logo"][0].path;
          }
          // Enregistrez l'utilisateur dans la base de données
          newUser.save(async (err, user) => {
            if (err) {
              console.error(err);
              res.status(500).send(err);
            } else {
              const token = crypto.randomBytes(64).toString("base64");

              await User.findByIdAndUpdate(user._id, {
                token: token,
              });

              let transporter = nodemailer.createTransport({
                host: emailConfig.host,
                port: emailConfig.port,
                auth: {
                  user: emailConfig.auth.user,
                  pass: emailConfig.auth.pass,
                },
              });

              let mailOptions = {
                from: "no-reply@iseevision.fr",
                to: req.body.email,
                subject: "Isee mail verification request",
                html: emailConfig.getHtml(encodeURIComponent(token), req.body.username),
              };

              transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                  console.error("Erreur lors de l'envoi de l'e-mail :", error);
                } else {
                  console.log(
                    "E-mail envoyé avec succès. Réponse du serveur :",
                    info.response
                  );
                }
              });

              res.send({
                // xsrfToken: xsrfToken,
                user: {
                  id: user._id,
                  username: user.username,
                  email: user.email,
                  isAdmin: user.isAdmin,
                },
              });
            }
          });
        }
      });
    }
  });
};

exports.updateUsers = async (req, res) => {
  const { error } = validateUpdate(req.body);
  const destServer = process.env.DEST_SERVER;
  const FILE_URL_PATH = process.env.FILE_URL;

  if (error) {
    console.log("error validator", error);
    return res.status(400).json({
      message: "Erreur lors de la mise à jour",
      error: error.details[0].message,
    });
  }

  try {
    const updateFields = {};
    // Seulement mettre à jour les champs fournis
    if (
      req.body.username !== undefined &&
      req.body.username !== "" &&
      req.body.username !== req.user.username
    ) {
      const existingUser = await User.findOne({ username: req.body.username });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "This username is already taken." });
      } else {
        updateFields.username = req.body.username;
      }
    }
    if (
      req.body.email !== "" &&
      req.body.email !== undefined &&
      req.body.email !== req.user.email
    ) {
      const existingEmail = await User.findOne({ email: req.body.email });
      if (existingEmail) {
        return res
          .status(400)
          .json({ message: "This email is already in use." });
      } else {
        updateFields.email = req.body.email;
      }
    }

    if (req.body.password !== undefined) {
      // Hash le mot de passe de l'utilisateur
      await bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res.status(500).send(err);
        } else {
          updateFields.password = hash;
        }
      });
    }

    if (req.body.isAdmin !== undefined) {
      updateFields.isAdmin = req.body.isAdmin;
    }

    if (
      req.files &&
      req.files["logo"] &&
      req.files["logo"][0]?.path !== undefined
    ) {
      const logoPathLocal = req.files["logo"][0].path;
      updateFields.logo_path = logoPathLocal.replace(destServer, FILE_URL_PATH);
    }

    if (
      req.files &&
      req.files["banner"] &&
      req.files["banner"][0]?.path !== undefined
    ) {
      const bannerPathLocal = req.files["banner"][0].path;
      updateFields.banner_path = bannerPathLocal.replace(
        destServer,
        FILE_URL_PATH
      );
    }

    updateFields.updatedAt = new Date();

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
    });

    res.send({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        isValidated: user.isValidated,
        logo: user.logo_path,
        banner: user.banner_path,
        expiresAt: user.expiresAt,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};

exports.deleteUsers = async (req, res) => {
  const userId = req.user._id;

  try {
    // Vérifiez si le mot de passe envoyé dans la requête correspond au mot de passe hashé de l'utilisateur
    bcrypt.compare(
      req.body.password,
      req.user.password,
      async (err, result) => {
        if (err) {
          res.status(500).send(err);
        } else if (!result) {
          res.status(401).send({ message: "Incorrect Password" });
        } else {
          const user = await User.deleteOne({ _id: userId });
          res.send(user);
        }
      }
    );
  } catch (error) {
    res.status(400).json({ error: "You don't have the permission" });
  }
};

exports.logoutUsers = async (req, res) => {
  res.clearCookie("access_token");
  res.clearCookie("refresh_token");
  res.send({ message: "Utilisateur déconnecté" });
};

exports.verificationUsers = async (req, res) => {
  const tokenVar = req.query.token;

  console.log("token", tokenVar);

  // Vérifier si le token existe
  User.findOne({ token: tokenVar }, async (err, user) => {
    if (err) {
      res.status(500).send({ error: err.message });
    } else if (user) {
      if (user.isValidated)
        return res.status(200).send({ message: "Adresse mail déjà validé" });

      await User.findByIdAndUpdate(user._id, { isValidated: true });

      return res
        .status(200)
        .send({ message: "Utilisateur vérifier avec success !" });
    } else {
      return res.status(404).send({ error: "Utilisateur introuvable !" });
    }
  });
};
