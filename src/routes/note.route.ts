import express from "express";
import { uploadNote, upload, getNoteStats, renameNote, duplicateNote, copyNote, markFavoriteNote } from "../controller/note.controller";

const router = express.Router();

//Upload a note (TXT file)
router.post("/uploads", upload, uploadNote);

//Get all Notes count, storage, and details
router.get("/all/stats/:userId", getNoteStats);

//Rename Note
router.put("/rename/:noteId", renameNote);

//Duplicate Note
router.post("/duplicate/:noteId/:userId", duplicateNote);

//Copy Note
router.post("/copy/:noteId", copyNote);

//Share Note
// router.get("/share/:noteId", shareNote);

//Mark Note as Favorite
router.put("/favorite/:noteId", markFavoriteNote);



export default router;
