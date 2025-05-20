import { db } from "../connect.js";
import jwt from "jsonwebtoken";
// import moment from "moment";

export const getLikes = (req, res) => {
  const q = "SELECT userId FROM likes  WHERE postId=?";

  db.query(q, [req.query.postId], (err, data) => {
    if (err) {
      console.error("Erreur SQL :", err);
      return res.status(500).json({ message: "Erreur SQL", details: err });
    }

    return res.status(200).json(data.map((like) => like.userId));
  });
};

export const addLike = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    const q = "INSERT INTO likes(`userId`, `postId`) VALUES (?)";
    const values = [userInfo.id, req.body.postId];

    db.query(q, [values], (err, data) => {
        console.error("Erreur lors de l'ajout du like :", err);
        if (err) return res.status(500).json(err);
      return res.status(200).json("Posrt has been liked.");
    });
  });
};

export const deleteLike = (req, res) => {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json("Not authenticated!");
  
    jwt.verify(token, "secretkey", (err, userInfo) => {
      if (err) return res.status(403).json("Token is not valid!");
  
      const q = "DELETE FROM likes WHERE `userId` = ? AND `postId` = ?";
      const values = [userInfo.id, req.query.postId];
  
      db.query(q, values, (err, data) => {
        if (err) {
          console.error("Erreur deleteLike:", err);
          return res.status(500).json({ error: "Erreur lors du DELETE", details: err });
        }
        return res.status(200).json("Post has been disliked.");
      });
    });
  };
  
