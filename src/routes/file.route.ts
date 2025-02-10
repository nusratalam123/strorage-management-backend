import express from "express";
import multer from "multer";
import { deleteFile, getImageStats, getPdfStats, getUserFiles, uploadFile, uploadNote } from "../controller/file.controller";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

//upload image/pdf both in same route
router.post("/upload", upload.single("file"), uploadFile);

router.post("/upload-note", uploadNote);


//Get all images count, storage usage, and all images in the single route
router.get("/images/stats/:userId", getImageStats);

//Get all PDFs count, storage usage, and all pdf in single route
router.get("/pdfs/stats/:userId", getPdfStats);

// Get user files
router.get("/user/:userId", getUserFiles);

// Delete file
router.delete("/delete/:fileId", deleteFile);

export default router;
