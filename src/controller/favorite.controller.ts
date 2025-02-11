import { Request, Response } from "express";
import File from "../model/file.model";
import User from "../model/user.model";
import folderModel from "../model/folder.model";

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
