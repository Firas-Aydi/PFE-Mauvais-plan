import moment from "moment";
import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";

// Get Posts
export const getPosts = (req, res) => {
  const userId = req.query.userId;
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Non authentifié!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token invalide!");

    // Cas entreprise
    if (userInfo.entreprise === "entreprise") {
      const q = `
        SELECT p.*, u.id AS userId, u.name, u.profilePic 
        FROM posts p 
        JOIN users u ON u.id = p.userId 
        WHERE p.companyEmail = ? 
        ORDER BY p.createdAt DESC
      `;
      db.query(q, [userInfo.email], (err, data) => {
        if (err) {
          console.error("Erreur SQL (entreprise):", err);
          return res.status(500).json({ message: "Erreur SQL", error: err });
        }
        // console.log("Données récupérées :", data);
        return res.status(200).json(data);
      });
    } else {
      // Cas user normal
      const q =
        userId && userId !== "undefined"
          ? `SELECT p.*, u.id AS userId, u.name, u.profilePic 
           FROM posts p 
           JOIN users u ON u.id = p.userId 
           WHERE p.userId = ? 
           ORDER BY p.createdAt DESC`
          : `SELECT p.*, u.id AS userId, u.name, u.profilePic 
           FROM posts p 
           JOIN users u ON u.id = p.userId 
           ORDER BY p.createdAt DESC`;

      const values = userId ? [userId] : [];

      db.query(q, values, (err, data) => {
        if (err) {
          console.error("Erreur SQL (user normal):", err);
          return res.status(500).json({ message: "Erreur SQL", error: err });
        }
        // console.log("Données récupérées :", data);
        return res.status(200).json(data);
      });
    }
  });
};

export const getPostById = (req, res) => {

  const q =
    "SELECT p.*, u.id AS userId, u.name, u.profilePic FROM posts p JOIN users u ON u.id = p.userId WHERE p.id = ?";
  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("Post non trouvé.");
    return res.status(200).json(data[0]);
  });
};

// Add Post
export const addPost = (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Non authentifié!");

  jwt.verify(token, "secretkey", async (err, userInfo) => {
    if (err) return res.status(403).json("Token invalide!");

    const { description, img, companyName, companyEmail, type } = req.body;

    if (!description || !companyName || !companyEmail) {
      return res.status(400).json("Champs requis manquants !");
    }

    const q = `
      INSERT INTO posts 
      (description, img, companyName, companyEmail, type, createdAt, userId) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      description,
      img || null,
      companyName,
      companyEmail,
      type,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
    ];

    db.query(q, values, async (err, data) => {
      if (err) {
        console.error("Erreur lors de l'ajout du post:", err);
        return res.status(500).json(err);
      }

      try {
        // Configuration du transporteur email
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "firasaydi0@gmail.com",
            pass: "lifd yrxi txyb jyxj",
          },
        });

        // Vérifie si l'entreprise a déjà un compte
        const checkUserQuery = "SELECT * FROM users WHERE email = ?";
        db.query(checkUserQuery, [companyEmail], async (err, userResult) => {
          if (err) {
            console.error(
              "Erreur lors de la vérification de l'utilisateur:",
              err
            );
            return res.status(500).json(err);
          }

          if (userResult.length === 0) {
            // Entreprise n'existe pas, création du compte
            const temporaryPassword = generateRandomPassword();
            const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

            const createUserQuery = `
  INSERT INTO users (name, email, password, role, entreprise) 
  VALUES (?, ?, ?, ?, ?)`;

            db.query(
              createUserQuery,
              [
                companyName,
                companyEmail,
                hashedPassword,
                "responsable",
                "entreprise",
              ],
              async (err, createResult) => {
                if (err) {
                  console.error(
                    "Erreur lors de la création du compte entreprise:",
                    err
                  );
                  return res.status(500).json(err);
                }

                // Email avec les identifiants
                await transporter.sendMail({
                  from: '"Mauvai Plan - Plateforme" <MauvaiPlan@gmail.com>',
                  to: companyEmail,
                  subject: `Votre compte a été créé sur Mauvai Plan`,
                  html: `
                  <p>Bonjour ${companyName},</p>
                  <p>Un compte a été créé pour vous afin de répondre aux candidatures sur notre plateforme.</p>
                  <p><strong>Vos identifiants :</strong></p>
                  <ul>
                    <li>Email : ${companyEmail}</li>
                    <li>Mot de passe temporaire : ${temporaryPassword}</li>
                  </ul>
                  <p>Veuillez vous connecter et modifier votre mot de passe après votre première connexion.</p>
                  <p>Cordialement,<br/>L'équipe Mauvai Plan.</p>
                `,
                });

                return res
                  .status(201)
                  .json("Post créé, compte entreprise créé et email envoyé !");
              }
            );
          } else {
            // L'entreprise existe déjà => envoi email normal
            await transporter.sendMail({
              from: '"Mauvai Plan - Plateforme" <MauvaiPlan@gmail.com>',
              to: companyEmail,
              subject: `Nouvelle candidature reçue sur votre annonce`,
              html: `
                <p>Bonjour ${companyName},</p>
                <p>Une nouvelle candidature a été déposée pour votre annonce :</p>
                <blockquote>${description}</blockquote>
                <p>Merci de consulter votre espace pour plus de détails.</p>
                <p>Cordialement,<br/>L'équipe Mauvai Plan.</p>
              `,
            });

            return res
              .status(201)
              .json("Post créé et email envoyé avec succès !");
          }
        });
      } catch (emailErr) {
        console.error("Erreur lors de l'envoi de l'email:", emailErr);
        return res
          .status(201)
          .json("Post créé mais erreur lors de l'envoi de l'email.");
      }
    });
  });
};

// Fonction pour générer un mot de passe temporaire
function generateRandomPassword() {
  return Math.random().toString(36).slice(-8); // Exemple : 'a1b2c3d4'
}

// Update Post
export const updatePost = (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Non authentifié!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token invalide!");

    const postId = req.params.id;
    const { companyName, description, img, type } = req.body;

    const q =
    "UPDATE posts SET companyName = ?, description = ?, img = ?, type = ? WHERE id = ? AND userId = ?";
  const values = [companyName, description, img, type, postId, userInfo.id];
  
    db.query(q, values, (err, data) => {
      if (err) {
        console.error("Erreur lors de la modification du post:", err);
        return res.status(500).json(err);
      }
      if (data.affectedRows > 0) {
        return res.status(200).json("Post mis à jour avec succès !");
      }
      return res.status(403).json("Action non autorisée ou post introuvable.");
    });
  });
};

// Delete Post
export const deletePost = (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Non authentifié!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token invalide!");

    const postId = req.params.id;

    const adminQuery = "DELETE FROM posts WHERE id = ?";
    const userQuery = "DELETE FROM posts WHERE id = ? AND userId = ?";

    const q = userInfo.role === "administrateur" ? adminQuery : userQuery;
    const values =
      userInfo.role === "administrateur" ? [postId] : [postId, userInfo.id];

    db.query(q, values, (err, data) => {
      if (err) {
        console.error("Erreur lors de la suppression du post:", err);
        return res.status(500).json(err);
      }
      if (data.affectedRows > 0) {
        const message =
          userInfo.role === "administrateur"
            ? "Post supprimé par l'administrateur."
            : "Post supprimé.";
        return res.status(200).json(message);
      }
      return res.status(403).json("Action non autorisée ou post introuvable.");
    });
  });
};

export const getCompanyPosts = (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) return res.status(401).json("Non authentifié!");

  jwt.verify(token, "secretkey", (err, companyInfo) => {
    if (err) return res.status(403).json("Token invalide!");

    const q = "SELECT * FROM posts WHERE companyEmail = ?";
    const values = [companyInfo.email];

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      return res.status(200).json(data);
    });
  });
};
