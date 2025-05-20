import { db } from "../connect.js";
// import jwt from "jsonwebtoken";

export const getUser = (req, res) => {
  const userId = req.params.userId;
  const q = `SELECT * FROM users WHERE id = ?`;

  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("User not found!");
    const { password, ...other } = data[0];
    return res.status(200).json(other);
  });
};

import bcrypt from "bcryptjs";

export const updateUser = (req, res) => {
  const userId = req.params.id;
  const { name, email, password, profilePic, role } = req.body;

  // Récupérer le mot de passe actuel s'il n'est pas fourni
  const getUserQuery = "SELECT password FROM users WHERE id = ?";
  db.query(getUserQuery, [userId], (err, result) => {
    if (err) return res.status(500).json(err);
    if (result.length === 0) return res.status(404).json("Utilisateur non trouvé");

    let newPassword = result[0].password; // par défaut garder l'ancien

    // Si un nouveau mot de passe est fourni, le hacher
    if (password && password.trim() !== "") {
      const salt = bcrypt.genSaltSync(10);
      newPassword = bcrypt.hashSync(password, salt);
    }

    const updateQuery = `
      UPDATE users
      SET name = ?, email = ?, password = ?, profilePic = ?, role = ?
      WHERE id = ?
    `;

    db.query(updateQuery, [name, email, newPassword, profilePic, role, userId], (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.affectedRows > 0) return res.status(200).json("Utilisateur mis à jour.");
      return res.status(404).json("Utilisateur non trouvé !");
    });
  });
};


