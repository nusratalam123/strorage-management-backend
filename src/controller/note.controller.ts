import { Request, Response } from "express";
import multer from "multer";
import cloudinary from "../utils/cloudinary";
import File from "../model/file.model";
import User from "../model/user.model";
import { Readable } from "stream";

//define Multer
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage, 
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "text/plain") {
      cb(null, true);
    } else {
      cb(new Error("Only .txt files are allowed"));
    }
  },
}).single("note");


//convert bytes to GB function
const bytesToGB = (bytes: number) => (bytes / (1024 * 1024 * 1024)).toFixed(10);


//upload note 
export const uploadNote = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const streamUpload = async () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "raw", folder: "notes" }, 
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        Readable.from(req.file!.buffer).pipe(stream);
      });
    };

    const uploadedFile = (await streamUpload()) as any;

    const newFile = new File({
      userId,
      name: req.file.originalname,
      type: "note",
      size: req.file.size,
      url: uploadedFile.secure_url,
      cloudinaryId: uploadedFile.public_id,
    });

    await newFile.save();

    user.usedStorage += req.file.size;
    await user.save();

    res.status(201).json({ message: "Note uploaded successfully", file: newFile });
  } catch (error) {
    res.status(500).json({ message: "Error uploading note", error });
  }
};


//get all note count, storage usage, and all note Details
export const getNoteStats = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
  
      const notes = await File.find({ userId, type: "note" });
      const noteCount = notes.length;
      const totalStorageUsed = notes.reduce((acc, note) => acc + (note.size??0), 0);
  
      res.status(200).json({
        noteCount,
        totalStorageUsedGB: bytesToGB(totalStorageUsed),
        notes,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching Note stats", error });
    }
  };



//Rename Note
export const renameNote = async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;
    const { newName } = req.body;

    const note = await File.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    note.name = newName;
    await note.save();

    res.status(200).json({ message: "Note renamed successfully", note });
  } catch (error) {
    res.status(500).json({ message: "Error renaming note", error });
  }
};

// ✅ Duplicate Note
export const duplicateNote = async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;

    const note = await File.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const duplicatedNote = new File({
      ...note.toObject() as object,
      _id: undefined, // To create a new entry
      name: `${note.name} - Copy`,
    });

    await duplicatedNote.save();
    res.status(201).json({ message: "Note duplicated successfully", duplicatedNote });
  } catch (error) {
    res.status(500).json({ message: "Error duplicating note", error });
  }
};

// ✅ Copy Note to Another Folder
export const copyNote = async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;
    const { destinationFolderId } = req.body;

    const note = await File.findById(noteId);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const copiedNote = new File({
      ...note.toObject() as object,
      _id: undefined,
      folderId: destinationFolderId,
    });

    await copiedNote.save();
    res.status(201).json({ message: "Note copied successfully", copiedNote });
  } catch (error) {
    res.status(500).json({ message: "Error copying note", error });
  }
};

//Share Note
// export const shareNote = async (req: Request, res: Response) => {
//   try {
//     const { noteId } = req.params;
//     const { sharedWithUserId } = req.body;

//     const note = await File.findById(noteId);
//     if (!note) return res.status(404).json({ message: "Note not found" });

//     note.sharedWith = note.sharedWith || [];
//     if (!note.sharedWith.includes(sharedWithUserId)) {
//       note.sharedWith.push(sharedWithUserId);
//     }

//     await note.save();
//     res.status(200).json({ message: "Note shared successfully", note });
//   } catch (error) {
//     res.status(500).json({ message: "Error sharing note", error });
//   }
// };


//Mark Note as Favorite
export const markFavoriteNote = async (req: Request, res: Response) => {
  try {
    const { noteId } = req.params;
    const note = await File.findById(noteId);

    if (!note) return res.status(404).json({ message: "Note not found" });

    note.favorite = !note.favorite;
    await note.save();

    res.status(200).json({ message: `Note ${note.favorite ? 'added to' : 'removed from'} favorites`, note });
  } catch (error) {
    res.status(500).json({ message: "Error updating favorite status", error });
  }
};

//Get All Favorite Notes
export const getFavoriteNotes = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const favoriteNotes = await File.find({ userId, type: "note", isFavorite: true });

    res.status(200).json({
      message: "Favorite notes fetched successfully",
      favoriteNotes,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching favorite notes", error });
  }
};
