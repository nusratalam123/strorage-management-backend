import express from "express";
import { uploadNote, upload, getNoteStats } from "../controller/note.controller";

const router = express.Router();

// ✅ Upload a note (TXT file)
router.post("/uploads", upload, uploadNote);

// ✅ Get all Notes count, storage, and details
router.get("/all/stats/:userId", getNoteStats);


export default router;
