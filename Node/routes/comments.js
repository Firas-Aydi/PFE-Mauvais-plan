import express from "express";
import { getComments, addComment, getNotifications, verifyToken } from "../controllers/comment.js";

const router = express.Router();

router.get("/", getComments);
router.post("/", addComment);
router.get("/notifications", verifyToken, getNotifications); // <- évite le conflit

export default router;
