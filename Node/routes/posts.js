import express from "express";
import { getPosts, getPostById, addPost, deletePost, updatePost } from "../controllers/post.js";

const router = express.Router();

router.get("/", getPosts);
router.get("/:id", getPostById);
router.post("/", addPost);
router.delete("/:id", deletePost);
router.put("/:id", updatePost); // nouvelle route


export default router;
