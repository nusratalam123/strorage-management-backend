import { Request, Response } from "express";
import Folder from "../model/folder.model";
import User from "../model/user.model";
import File from "../model/file.model";


// ✅ Convert bytes to GB function
const bytesToGB = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(10);


// Create Folder
export const createFolder = async (req: Request, res: Response) => {
  try {
    const { userId, name, parentFolder } = req.body;

    const newFolder = new Folder({
      userId,
      name,
      parentFolder: parentFolder || null,
    });

    await newFolder.save();
    res.status(201).json(newFolder);
  } catch (error) {
    res.status(500).json({ message: "Folder creation failed", error });
  }
};


export const getFolderStats = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // ✅ Get all folders for the user
      const folders = await Folder.find({ userId });
  
      let totalFolderStorage = 0; // Total storage used in all folders
  
      // ✅ Calculate storage used in each folder
      const folderStats = await Promise.all(
        folders.map(async (folder) => {
          const filesInFolder = await File.find({ folderId: folder._id });
          const folderSize = filesInFolder.reduce((acc, file) => acc + (file.size??0), 0);
          
          totalFolderStorage += folderSize; // Add to total folder storage
  
          return {
            _id: folder._id,
            name: folder.name,
            parentFolder: folder.parentFolder || null,
            fileCount: filesInFolder.length,
            usedStorageGB: bytesToGB(folderSize),
          };
        })
      );
  
      res.status(200).json({
        folderCount: folders.length,
        totalFolderStorageGB: bytesToGB(totalFolderStorage), // Total storage used in all folders
        folderStats,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching folder stats", error });
    }
  };