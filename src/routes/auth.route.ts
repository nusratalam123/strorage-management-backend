import { Router } from "express";
import { login, logout, resetPassword, resetPasswordForApp, sendOtpForgetPassword, signup, verifyOTP } from "../controller/auth.controller";

const router = Router();

// register new user
router.post("/signup", signup);

// user login
router.post("/login", login);

// user logout
router.delete("/logout", logout);

//send OTP
router.post('/forget-password', sendOtpForgetPassword);

//verify OTP
router.post('/verify-otp', verifyOTP);

// reset password
router.post("/reset-password", resetPassword);


export default router;
