const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

const { validateLogin } = require("../middleware/validator");
const { validateRegister } = require("../middleware/validator");

exports.userDisplayAll = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ error: "Error fetching all users" });
  }
};

exports.userProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ error: "Error fetching user profile" });
  }
};

exports.userLogin = async (req, res) => {
  // Joi Validation
  const { error } = validateLogin(req.body);

  if (error) {
    console.log(error);
    return res.send(error.details);
  }

  // Recherchez l'utilisateur dans la base de données en utilisant l'e-mail envoyé dans la requête
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      res.status(500).send(err);
    } else if (!user) {
      res.status(401).send({ message: "Incorrect email or password" });
    } else {
      // Vérifiez si le mot de passe envoyé dans la requête correspond au mot de passe hashé de l'utilisateur
      bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
          res.status(500).send(err);
        } else if (!result) {
          res.status(401).send({ message: "Incorrect email or password" });
        } else {
          // Générez un jeton JWT pour l'utilisateur
          const token = jwt.sign(
            { id: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
          );
          res.send({ token });
        }
      });
    }
  });
};

exports.userRegister = async (req, res) => {
  const { error } = validateRegister(req.body);

  if (error) {
    console.log(error);
    return res.send(error.details);
  }

  // Vérifiez si l'adresse e-mail est déjà utilisée
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      res.status(500).send(err);
    } else if (user) {
      res.status(400).send({ message: "This email address is already in use" });
    } else {
      // Hash le mot de passe de l'utilisateur
      bcrypt.hash(req.body.password, 10, (err, hash) => {
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
          });
          // Enregistrez l'utilisateur dans la base de données
          newUser.save((err, user) => {
            if (err) {
              console.error(err);
              res.status(500).send(err);
            } else {
              // Générez un jeton JWT pour l'utilisateur
              const token = jwt.sign(
                { id: user._id, username: user.username, email: user.email, isAdmin: user.isAdmin },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
              );
              res.send({ token });
            }
          });
        }
      });
    }
  });
};

exports.userUpdate = async (req, res) => {
  try {

    if (!req.user) return res.status(401).send({ error: "Not authenticated" });


    const user = await User.findByIdAndUpdate(
      req.query._id,
      { ...req.body },
      { new: true }
    );
    res.status(200).send(user);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};

exports.userDelete = async (req, res) => {
  try {
    const paramsId = req.query._id;
    const userId = req.user._id;

    if (!req.user) return res.status(401).send({ error: "Not authenticated" });

    if (paramsId !== undefined) {
      if (paramsId != userId && req.user.role != "Admin") {
        return res.status(403).send({ error: "You don't have the permission" });
      }
    } else {
      return res
        .status(400)
        .send({ error: "Missing user ID in query parameters" });
    }

    const user = await User.deleteOne({ _id: paramsId });
    res.send(user);
  } catch (error) {
    res.status(400).json({ error: "You don't have the permission" });
  }
};
