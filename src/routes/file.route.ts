import express from "express";
import multer from "multer";
import { copyFile, deleteFile, duplicateFile, getFilesByDate, getImageStats, getPdfStats, getUserFiles, markFavorite, renameFile, restoreFile, softDeleteFile, uploadFile, uploadNote } from "../controller/file.controller";

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


router.put("/rename/:fileId", renameFile);
router.post("/duplicate/:fileId/:userId", duplicateFile);
router.post("/copy", copyFile);
// router.get("/share/:fileId", shareFile);
router.put("/favorite/:fileId", markFavorite);
router.put("/soft-delete/:fileId", softDeleteFile);
router.put("/restore/:fileId", restoreFile);

router.get("/files-by-date/:userId/:date", getFilesByDate);


export default router;
