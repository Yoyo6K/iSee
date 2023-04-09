const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

exports.userDisplayAll = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).send({
        error: "Access denied. You don't have the required permissions.",
      });
    }
    const users = await User.find().select("-password");
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({ error: "Error fetching all users" });
  }
};

exports.userProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).send(user);
  } catch (error) {
    res.status(500).send({ error: "Error fetching user profile" });
  }
};

//exports.userLogin = 


exports.userRegister = async (req, res) => {
  try {
    // Vérifiez si l'adresse e-mail est déjà utilisée
    const existingUser = await User.findOne({ email: req.body.email });

    if (existingUser) {
      res.status(400).send({ message: "This email address is already in use" });
    } else {
      // Hash le mot de passe de l'utilisateur
      const hash = await bcrypt.hash(req.body.password, 12);

      // Créez un nouvel utilisateur avec les données envoyées dans la requête et le mot de passe hashé
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        isAdmin: req.body.isAdmin,
        password: hash,
      });

      // Enregistrez l'utilisateur dans la base de données
      const user = await newUser.save();

      // Générez un jeton JWT pour l'utilisateur
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.send({ token });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

exports.userUpdate = async (req, res) => {
  try {
    const paramsId = req.query._id;
    let userId = req.user._id;

    if (!req.user) return res.status(401).send({ error: "Not authenticated" });

    if (paramsId !== undefined) {
      if (paramsId != userId && req.user.role != "Admin") {
        return res.status(403).send("You dont have the permission");
      } else {
        userId = paramsId;
      }
    }

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
