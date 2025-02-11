import { Request, Response } from "express";
import Folder from "../model/folder.model";
import User from "../model/user.model";
import File from "../model/file.model";
import moment from "moment";


// ✅ Convert bytes to GB function
const bytesToGB = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(10);


// Create Folder
export const createFolder = async (req: Request, res: Response) => {
  try {
    const { userId, name, parentFolder } = req.body;

    const folderSize = 0; 

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const newUsedStorage = user.usedStorage + folderSize;
    if (newUsedStorage > user.maxStorage) {
      return res.status(400).json({ message: "Insufficient storage" });
    }

    const folder = new Folder({
      userId: userId,
      name,
      parentFolder: parentFolder || null, 
      size: folderSize,
    });

    await folder.save();

    user.usedStorage += folderSize;
    await user.save();

    return res.status(201).json({ message: "Folder created successfully", folder });
  } catch (error) {
    res.status(500).json({ message: "Folder creation failed", error });
  }
};

//get all folders count, storage usages, and all folder details
export const getFolderStats = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const folders = await Folder.find({ userId });
  
      let totalFolderStorage = 0; 
  
      const folderStats = await Promise.all(
        folders.map(async (folder) => {
          const filesInFolder = await File.find({ folderId: folder._id });
          const folderSize = filesInFolder.reduce((acc, file) => acc + (file.size??0), 0);
          
          totalFolderStorage += folderSize;
  
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
        message: "get all folder fetched successfully",
        folderCount: folders.length,
        totalFolderStorageGB: bytesToGB(totalFolderStorage), 
        folderStats,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching folder stats", error });
    }
  };

// Rename Folder
export const renameFolder = async (req: Request, res: Response) => {
  const { folderId, newName } = req.body;

  try {
    const folder = await Folder.findByIdAndUpdate(folderId, { name: newName }, { new: true });
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    res.status(200).json({ message: "Folder renamed successfully", folder });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Rename Folder
export const updateFolderInfo = async (req: Request, res: Response) => {
  const { folderId} = req.body;

  try {
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const updateFolder = await Folder.findByIdAndUpdate(folderId, req.body , { new: true });
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    res.status(200).json({ message: "Folder updated successfully", updateFolder });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Duplicate Folder
export const duplicateFolder = async (req: Request, res: Response) => {
  const { folderId } = req.body;

  try {
    const originalFolder = await Folder.findById(folderId);
    if (!originalFolder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const newFolder = new Folder({
      userId: originalFolder.userId,
      name: `${originalFolder.name} - Copy`,
      parentFolder: originalFolder.parentFolder,
      createdAt: new Date(),
    });

    await newFolder.save();
    res.status(201).json({ message: "Folder duplicated successfully", newFolder });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Copy Folder (with files)
export const copyFolder = async (req: Request, res: Response) => {
  const { folderId } = req.body;

  try {
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    const newFolder = new Folder({
      userId: folder.userId,
      name: `${folder.name} - Copy`,
      parentFolder: folder.parentFolder,
      createdAt: new Date(),
    });

    await newFolder.save();

    const files = await File.find({ folderId: folderId });
    files.forEach(async (file) => {
      const newFile = new File({
        ...file.toObject() as object,
        folderId: newFolder._id, 
      });

      await newFile.save();
    });

    res.status(201).json({ message: "Folder and files copied successfully", newFolder });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// // Share Folder (simply return folder details for now, implementation depends on actual sharing method)
// export const shareFolder = async (req: Request, res: Response) => {
//   const { folderId, sharedWithUserIds } = req.body;

//   try {
//     const folder = await Folder.findById(folderId);
//     if (!folder) {
//       return res.status(404).json({ message: "Folder not found" });
//     }

//     // Assuming the "share" operation involves adding a list of shared user IDs
//     folder.sharedWith = sharedWithUserIds;  // Add shared users to folder's "sharedWith" field
//     await folder.save();

//     res.status(200).json({ message: "Folder shared successfully", folder });
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };

// Delete Folder
export const deleteFolder = async (req: Request, res: Response) => {
  const { folderId } = req.body;

  try {
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    await File.deleteMany({ folderId });

    await folder.deleteOne();
    res.status(200).json({ message: "Folder deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// add favorite folder
export const favoriteFolder = async (req: Request, res: Response) => {
  const { folderId } = req.body;

  try {
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    folder.favorite = !folder.favorite; 
    await folder.save();

    res.status(200).json({ message: folder.favorite ? "Folder added to favorites" : "Folder removed from favorites", folder });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

//get all favorite folders count, storage usages, and all folder details
export const getFavoriteFolders = async (req: Request, res: Response) => {
  try {
    const folders = await Folder.find({ favorite: true });

    const folderStats = await Promise.all(
      folders.map(async (folder) => {
        const filesInFolder = await File.find({ folderId: folder._id });
        const folderSize = filesInFolder.reduce((acc, file) => acc + (file.size??0), 0);
  
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
      message: "get all favorite folder fetched successfully",
      folderCount: folders.length,
      folders,
      folderStats
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching favorite folder stats", error });
  }
};

//get today's folders count, storage usages, and all folder details
export const getTodaysFolder =async (req: Request, res: Response) => {
  try {
    const startOfDay = moment().startOf("day").toDate();
    const endOfDay = moment().endOf("day").toDate();

    const folders = await Folder.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    const folderStats = await Promise.all(
      folders.map(async (folder) => {
        const filesInFolder = await File.find({ folderId: folder._id });
        const folderSize = filesInFolder.reduce((acc, file) => acc + (file.size??0), 0);
  
        return {
          _id: folder._id,
          name: folder.name,
          parentFolder: folder.parentFolder || null,
          fileCount: filesInFolder.length,
          usedStorageGB: bytesToGB(folderSize),
        };
      })
    )
    res.status(200).json({
      message: "get all folder fetched successfully",
      folderCount: folders.length,
      folders,
      folderStats
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching today folder stats", error });
  }
};


