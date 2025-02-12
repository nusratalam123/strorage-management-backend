import express from "express";
import multer from "multer";
import { copyFile, 
    deleteFile, 
    duplicateFile, 
    getFilesByDate, 
    getImageStats, 
    getPdfStats, 
    getSingleImage, 
    getSingleNote, 
    getSinglePdf, 
    getUserFiles, 
    markFavorite, 
    renameFile, 
    restoreFile, 
    softDeleteFile, 
    uploadFile } from "../controller/file.controller";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

//upload image/pdf both in same route
router.post("/upload", upload.single("file"), uploadFile);

//Get all images count, storage usage, and all images in the single route
router.get("/images/stats/:userId", getImageStats);

//Get all PDFs count, storage usage, and all pdf in single route
router.get("/pdfs/stats/:userId", getPdfStats);

//Get single image
router.get("/single/image/:userId/:fileId", getSingleImage);

//Get single pdf
router.get("/single/pdf/:userId/:fileId", getSinglePdf);

//Get single pdf
router.get("/single/note/:userId/:fileId", getSingleNote);

// Get user files
router.get("/user/:userId", getUserFiles);

// Get files by date
router.get("/files-by-date/:userId/:date", getFilesByDate);

// Rename file
router.put("/rename/:fileId", renameFile);

// Duplicate file
router.post("/duplicate/:fileId/:userId", duplicateFile);

// Copy file
router.post("/copy", copyFile);

// Share file
// router.get("/share/:fileId", shareFile);

// Mark file as favorite
router.put("/favorite/:fileId", markFavorite);

// Soft delete file
router.put("/soft-delete/:fileId", softDeleteFile);

// Restore file
router.put("/restore/:fileId", restoreFile);

// Delete file
router.delete("/delete/:fileId", deleteFile);




export default router;
