import { db } from "../connect.js";
import jwt from "jsonwebtoken";
import moment from "moment";

const SECRET = "secretkey"; // ou récupérée via process.env.SECRET

export const getComments = (req, res) => {
  const q =
    "SELECT c.*, u.id AS userId, name, profilePic FROM comments AS c JOIN users AS u ON u.id = c.userId WHERE c.postId=? ORDER BY c.createdAt DESC";

  db.query(q, [req.query.postId], (err, data) => {
    if (err) {
      console.error("Erreur SQL :", err);
      return res.status(500).json({ message: "Erreur SQL", details: err });
    }
    return res.status(200).json(data);
  });
};

export const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Non authentifié !");

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).json("Token invalide !");
    req.userId = decoded.id;
    next();
  });
};

export const getNotifications = (req, res) => {
  const userId = req.userId;
  // console.log("Query params:", req.query);
  // console.log("Headers:", req.headers);
  // console.log("Method:", req.method);
  // console.log("URL:", req.url);
  // console.log("Access Token from cookies:", req.cookies.accessToken);
  // console.log("userId extrait du token :", req.userId);

  const q = `
    SELECT n.*, u.name AS senderName, u.profilePic
    FROM notifications AS n
    JOIN users AS u ON u.id = n.senderId
    WHERE n.receiverId = ?
    ORDER BY n.createdAt DESC
  `;

  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    res.status(200).json(data);
  });
};

export const addComment = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, SECRET, (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const insertCommentQuery =
      "INSERT INTO comments(`description`, `img`, `createdAt`, `userId`, `postId`) VALUES (?)";

    const values = [
      req.body.description,
      req.body.img || null,
      moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
      userInfo.id,
      req.body.postId,
    ];

    db.query(insertCommentQuery, [values], (err, result) => {
      if (err) return res.status(500).json(err);

      // Récupérer l’auteur du post
      const postUserQuery = "SELECT userId FROM posts WHERE id = ?";
      db.query(postUserQuery, [req.body.postId], (err, postData) => {
        if (err) return res.status(500).json(err);

        const receiverId = postData[0]?.userId;
        if (!receiverId) return res.status(404).json("Post not found.");

        // Ne pas notifier si l’auteur commente son propre post
        if (receiverId !== userInfo.id) {
          const notifQuery = `
            INSERT INTO notifications (senderId, receiverId, postId, createdAt)
            VALUES (?, ?, ?, ?)
          `;

          db.query(
            notifQuery,
            [
              userInfo.id,
              receiverId,
              req.body.postId,
              moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
            ],
            (notifErr) => {
              if (notifErr)
                console.error("Erreur lors de l'ajout de la notification :", notifErr);
            }
          );
        }

        return res.status(200).json("Commentaire ajouté avec succès.");
      });
    });
  });
};
