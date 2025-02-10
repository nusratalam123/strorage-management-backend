import bcrypt from "bcrypt";
import CryptoJS from "crypto-js";
import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: [3, "name must be at least 3 characters"],
      maxLength: [100, "name is too large"],
    },
    email: {
      type: String,
      validate: [validator.isEmail, "provide a valid email"],
      trim: true,
      lowercase: true,
      unique: true,
      required: [true, "email address is required"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
      minLength: [6, "password must be at least 6 characters"],
    },
    role: {
      type: String,
      default: "USER",
      enum: ["USER", "ADMIN"],
    },
    
    status: {
      type: String,
      default: "ACTIVE",
      enum: ["ACTIVE", "BANNED"],
    },
    usedStorage: { type: Number, default: 0 },
    maxStorage: { type: Number, default: 15 * 1024 * 1024 * 1024 },
    confirmationToken: String,
    confirmationTokenExpires: Date,
    resetToken: String,
    resetTokenExpiry: Date,    
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
    next();
  } catch (err) {
    next(err as undefined);
  }
});

// comparePassword
userSchema.methods.comparePassword = function (password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
};

// generateConfirmationToken
userSchema.methods.generateConfirmationToken = function () {
  const token = CryptoJS.SHA256("token");
  this.confirmationToken = token;

  const date = new Date();
  date.setDate(date.getDate() + 1);
  this.confirmationTokenExpires = date;

  return token;
};

const User = mongoose.model("User", userSchema);
export default User;
