import mongoose, { Schema, Document } from "mongoose";

interface IFile extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  name: string;
  type: "image" | "pdf" | "note";
  size?: number;
  url?: string;
  cloudinaryId?: string;
  content?: string; // Only for notes
  folderId?: mongoose.Schema.Types.ObjectId | null;
  favorite: boolean;
  isDeleted: boolean;
  createdAt: Date;
}

const FileSchema = new Schema<IFile>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ["image", "pdf", "note"], required: true },
  size: { type: Number },
  url: { type: String },
  cloudinaryId: { type: String },
  content: { type: String }, // For notes
  folderId: { type: Schema.Types.ObjectId, ref: "Folder", default: null },
  favorite: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IFile>("File", FileSchema);


// import mongoose, { Schema } from "mongoose";


// const fileSchema = new mongoose.Schema(
//   {
//     userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
//     name: { type: String, required: true },
//     type: { type: String, enum: ["note", "image", "folder", "pdf"], required: true },
//     size: { type: Number, required: true },
//     path: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now },
//     updatedAt: { type: Date, default: Date.now },
//     },
//   {
//     timestamps: true,
//   },
// );


// const File = mongoose.model("file", fileSchema);
// export default File;
