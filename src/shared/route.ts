import { Router } from "express";
import authRoutes from "./../routes/auth.route";
import userRoutes from "./../routes/user.route";
import fileRoutes from "./../routes/file.route";
import folderRoutes from "./../routes/folder.route";
import noteRoutes from "./../routes/note.route";
import favoriteRoutes from "./../routes/favorite.route";
import settingRoute from "./../routes/setting.route";


const router = Router();

// Root route
router.get("/", (_, res) => {
  res.send("App Working successfully");
});

// general Routes
router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/files", fileRoutes);
router.use("/folders", folderRoutes);
router.use("/notes", noteRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/setting",settingRoute)


// Handle not found
router.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Not Found",
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API Not Found",
      },
    ],
  });
  next();
});

export default router;
