import { Router } from "express";
import {
  checkUserStorage,
  createUser,
  deleteUser,
  getAllUsers,
  getSingleUser,
  getSingleUserStatus,
  updateUserProfile,
  updateUserStatus,
} from "../controller/user.controller";

const router = Router();

//get all users
router.get("/all", getAllUsers);

//get single user
router.get("/single/:id", getSingleUser);

//get single user status
router.get("/single/status/:id", getSingleUserStatus);

//create new user
router.post("/create", createUser);

//update user profile
router.put("/update-profile/:id", updateUserProfile);

//update user status
router.patch("/change-status/:id", updateUserStatus);

//check user storage
router.get("/storage/:userId", checkUserStorage);

//delete user
router.delete("/delete/:id", deleteUser);

export default router;