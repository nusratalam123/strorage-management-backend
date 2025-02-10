import { Request, Response } from "express";
import cloudinary from "../utils/cloudinary";
import File from "../model/file.model";
import User from "../model/user.model";
import fs from "fs";

// Upload Image/PDF
export const uploadFile = async (req: Request, res: Response) => {
  try {
    const { userId, type, folderId } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check storage limit
    if (user.usedStorage + file.size > user.maxStorage) {
      return res.status(400).json({ message: "Storage limit exceeded" });
    }

    // Upload file to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(file.path, {
      resource_type: "auto",
    });

    // Save metadata
    const newFile = new File({
      userId,
      name: file.originalname,
      type,
      size: file.size,
      url: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      folderId: folderId || null,
    });

    await newFile.save();
    user.usedStorage += file.size;
    await user.save();

    fs.unlinkSync(file.path);
    res.status(201).json(newFile);
  } catch (error) {
    res.status(500).json({ message: "Upload failed", error });
  }
};

// Upload Note
export const uploadNote = async (req: Request, res: Response) => {
  try {
    const { userId, name, content, folderId } = req.body;

    const newNote = new File({
      userId,
      name,
      type: "note",
      content,
      folderId: folderId || null,
    });

    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ message: "Failed to save note", error });
  }
};


// ✅ Get Image Count, Total Storage Used, and Images
export const getImageStats = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
  
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      // ✅ Get all images for the user
      const images = await File.find({ userId, type: "image" });
  
      // ✅ Count images and calculate storage usage
      const imageCount = images.length;
      const totalStorageUsed = images.reduce((acc, img) => acc + (img.size??0), 0);
  
      res.status(200).json({
        imageCount,
        totalStorageUsed,
        images, // Array of image details
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching image stats", error });
    }
  };

  // ✅ Convert bytes to GB function
const bytesToGB = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(10);

// ✅ Get PDF Count, Storage Usage, and Details
export const getPdfStats = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const pdfs = await File.find({ userId, type: "pdf" });
    const pdfCount = pdfs.length;
    const totalStorageUsed = pdfs.reduce((acc, pdf) => acc + (pdf.size??0), 0);

    res.status(200).json({
      pdfCount,
      totalStorageUsedGB: bytesToGB(totalStorageUsed),
      pdfs,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching PDF stats", error });
  }
};
// ✅ Get User Files
export const getUserFiles = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const files = await File.find({ userId });
  
      if (!files.length) {
        return res.status(404).json({ message: "No files found for this user" });
      }
  
      res.status(200).json(files);
    } catch (error) {
      res.status(500).json({ message: "Error fetching files", error });
    }
  };
  
  // ✅ Delete File
  export const deleteFile = async (req: Request, res: Response) => {
    try {
      const { fileId } = req.params;
      const file = await File.findById(fileId);
  
      if (!file) return res.status(404).json({ message: "File not found" });
  
      // Delete file from Cloudinary (if stored there)
      if (file.cloudinaryId) {
        await cloudinary.uploader.destroy(file.cloudinaryId);
      }
  
      // Update user's storage if the file has a size
      const user = await User.findById(file.userId);
      if (user) {
        user.usedStorage -= file.size ?? 0; // Ensure file.size is never undefined
        await user.save();
      }
  
      // Delete file from DB
      await file.deleteOne();
  
      res.status(200).json({ message: "File deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting file", error });
    }
  };