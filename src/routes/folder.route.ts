import express from "express";
import { copyFolder, createFolder, deleteFolder, duplicateFolder, favoriteFolder, getFavoriteFolders, getFolderStats, getTodaysFolder, renameFolder } from "../controller/folder.controller";

const router = express.Router();

//create folder
router.post("/create", createFolder);

//get all folders count, storage usages, and all folder details
router.get("/folders/stats/:userId", getFolderStats);

//rename Folder
router.put("/rename", renameFolder);

//duplicate Folder
router.post("/duplicate", duplicateFolder);

//copy Folder
router.post("/copy", copyFolder);

//share Folder
// router.post("/share", shareFolder);

//delete Folder
router.delete("/delete", deleteFolder);

//favorite folder
router.put("/favorite", favoriteFolder);

//today folder
router.get("/today-folder", getTodaysFolder);

// Favorite Folder
router.get("/favorite/all", getFavoriteFolders);

export default router;
