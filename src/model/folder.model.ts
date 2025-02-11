import mongoose, { Schema, Document } from "mongoose";

interface IFolder extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  name: string;
  parentFolder?: mongoose.Schema.Types.ObjectId | null;
  createdAt: Date;
  size: number; 
  favorite: boolean;
}

const FolderSchema = new Schema<IFolder>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  parentFolder: { type: Schema.Types.ObjectId, ref: "Folder", default: null },
  createdAt: { type: Date, default: Date.now },
  size: { type: Number, default: 0 },
  favorite: { type: Boolean, default: false },
});

// Hook to update the user's total storage size when a file is added
FolderSchema.pre("save", async function (next) {
  const folder = this;

  if (folder.isModified("size")) {
    const user = await mongoose.model("User").findById(folder.userId);
    if (user) {
      user.totalSize -= folder.size; 
      await user.save();
    }
  }

  next();
});

export default mongoose.model<IFolder>("Folder", FolderSchema);
