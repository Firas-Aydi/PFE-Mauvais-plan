import express from "express";
import { getUser } from "../controllers/user.js";
import { updateUser } from "../controllers/user.js";
import { db } from "../connect.js";

const router = express.Router();

router.get("/find/:userId", getUser);
router.put("/:id", updateUser);

router.get("/", (req, res) => {
  const q = "SELECT id, email, name, password, profilePic, role, entreprise, created_at FROM users";
  db.query(q, (err, data) => {
    if (err) {
      console.log("Erreur lors de la récupération des utilisateurs :", err);
      return res.status(500).json(err);
    }
    res.json(data);
  });
});

router.delete("/:id", (req, res) => {
  const q = "DELETE FROM users WHERE id = ?";
  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json("Utilisateur supprimé.");
  });
});

router.get("/search", (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json("Nom requis");

  const q = `
    SELECT id, name, profilePic FROM users
    WHERE name LIKE ?
    LIMIT 10
  `;
  db.query(q, [`%${name}%`], (err, data) => {
    if (err) {
      console.error("Erreur de recherche :", err);
      return res.status(500).json(err);
    }
    res.json(data);
  });
});

export default router;
