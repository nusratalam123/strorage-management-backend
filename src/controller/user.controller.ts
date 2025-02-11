import { NextFunction, Request, Response } from "express";
import User from "./../model/user.model";

// get all users
export const getAllUsers = async (
  _: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await User.find({}).sort({ name: -1 });

    res.status(200).json({
      message: "Users get successfully",
      data: users,
    });
  } catch (err) {
    next(err);
  }
};

//Check User Storage
export const checkUserStorage = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const usedStorageGB = (user.usedStorage / (1024 ** 3)).toFixed(10);
    const maxStorageGB = (user.maxStorage / (1024 ** 3)).toFixed(10);
    const remainingStorageGB = ((user.maxStorage - user.usedStorage) / (1024 ** 3)).toFixed(10);

    res.status(200).json({
      message: "Storage data fetched successfully",
      usedStorage: `${usedStorageGB} GB`,
      totalStorage: `${maxStorageGB} GB`,
      availableStorage: `${remainingStorageGB} GB`,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching storage data", error });
  }
};

// get single user
export const getSingleUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findOne({ _id: req.params.id });

    if (!user) {
      res.status(400).json({
        message: "User Not found",
      });
    }

    res.status(200).json({
      message: "User get successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// get single user status
export const getSingleUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findOne({ _id: req.params.id }).select("status");

    if (!user) {
      res.status(200).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User status get successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// create new user
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = req.body;

    if (Object.keys(data).length === 0) {
      res.status(400).json({
        message: "Data can't be empty",
      });
    }

    const user = await User.create(data);

    res.status(201).json({
      message: "User created Successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

// update a profile
export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      res.status(400).json({
        message: "User not found",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, req.body);

    res.status(200).json({
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

// delete user
export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      res.status(400).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "User Deleted Successfully",
    });
  } catch (err) {
    next(err);
  }
};

// update user status
export const updateUserStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { status: req.body.status } },
      { new: true },
    );

    if (!user) {
      res.status(400).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Status changed successfully",
      data: user,
    });
  } catch (err) {
    next(err);
  }
};
