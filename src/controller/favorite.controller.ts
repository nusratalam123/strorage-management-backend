import { Request, Response } from "express";
import File from "../model/file.model";
import User from "../model/user.model";
import folderModel from "../model/folder.model";
import cloudinary from "../utils/cloudinary"; // Assuming you're using Cloudinary for storage

const bytesToGB = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(10);

export const getFavoriteItems = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const favoriteItems = await File.find({ userId, favorite: true });

    const totalFavoriteStorageUsed = favoriteItems.reduce(
      (acc, item) => acc + (item.size ?? 0),
      0
    );
    const favoriteFolders = await folderModel.find({ userId, favorite: true });

    res.status(200).json({
      message: "Favorite items fetched successfully",
      totalFavoriteCount: favoriteItems.length+favoriteFolders.length,
      totalFavoriteStorageUsedGB: bytesToGB(totalFavoriteStorageUsed),
      favoriteItems,
      favoriteFolders
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching favorite items", error });
  }
};




// Determine if it's a file or folder
const findItemById = async (itemId: string) => {
  let item = await File.findById(itemId);
  if (!item) item = await folderModel.findById(itemId);
  return item;
};

//Copy Favorite Item (File/Folder)
export const copyFavoriteItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { destinationFolderId } = req.body;

    const item = await findItemById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const copiedItem = new (item instanceof File ? File : folderModel)({
      ...item.toObject() as object,
      _id: undefined,
      folderId: destinationFolderId || item.folderId, 
      name: `${item.name} - Copy`,
    });

    await copiedItem.save();
    res.status(201).json({ message: "Favorite item copied successfully", copiedItem });
  } catch (error) {
    res.status(500).json({ message: "Error copying item", error });
  }
};

//Rename Favorite Item
export const renameFavoriteItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { newName } = req.body;

    const item = await findItemById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.name = newName;
    await item.save();

    res.status(200).json({ message: "Favorite item renamed successfully", item });
  } catch (error) {
    res.status(500).json({ message: "Error renaming item", error });
  }
};

//Duplicate Favorite Item
export const duplicateFavoriteItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;

    const item = await findItemById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const duplicatedItem = new (item instanceof File ? File : folderModel)({
      ...item.toObject() as object,
      _id: undefined, 
      name: `${item.name} - Duplicate`,
    });

    await duplicatedItem.save();
    res.status(201).json({ message: "Favorite item duplicated successfully", duplicatedItem });
  } catch (error) {
    res.status(500).json({ message: "Error duplicating item", error });
  }
};

//Delete Favorite Item
export const deleteFavoriteItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;

    const item = await findItemById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item instanceof File && item.cloudinaryId) {
      await cloudinary.uploader.destroy(item.cloudinaryId, { resource_type: "raw" });
    }

    await item.deleteOne();
    res.status(200).json({ message: "Favorite item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting item", error });
  }
};

// // ✅ Share Favorite Item
// export const shareFavoriteItem = async (req: Request, res: Response) => {
//   try {
//     const { itemId } = req.params;
//     const { sharedWithUserId } = req.body;

//     const item = await findItemById(itemId);
//     if (!item) return res.status(404).json({ message: "Item not found" });

//     item.sharedWith = item.sharedWith || [];
//     if (!item.sharedWith.includes(sharedWithUserId)) {
//       item.sharedWith.push(sharedWithUserId);
//     }

//     await item.save();
//     res.status(200).json({ message: "Favorite item shared successfully", item });
//   } catch (error) {
//     res.status(500).json({ message: "Error sharing item", error });
//   }
// };

//Mark as Unfavorite
export const toggleFavoriteItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;

    const item = await findItemById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.favorite = !item.favorite;
    await item.save();

    res.status(200).json({
      message: `Item ${item.favorite ? "added to" : "removed from"} favorites`,
      item,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating favorite status", error });
  }
};

