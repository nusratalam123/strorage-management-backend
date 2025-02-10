import mongoose, { Schema, Document } from "mongoose";

interface IFolder extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  name: string;
  parentFolder?: mongoose.Schema.Types.ObjectId | null;
  createdAt: Date;
}

const FolderSchema = new Schema<IFolder>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  parentFolder: { type: Schema.Types.ObjectId, ref: "Folder", default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IFolder>("Folder", FolderSchema);
