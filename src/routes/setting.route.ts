import { Router } from "express";
import { changedPassword, getAboutUs, getPrivacyPolicy, getTermsAndConditions } from "../controller/setting.controller";

const router = Router();

// reset password
router.post("/changed-password", changedPassword);

// get Terms and Conditions
router.get("/terms-and-conditions", getTermsAndConditions);

// get About Us
router.get("/about-us", getAboutUs);

// get Privacy Policy
router.get("/privacy-policy", getPrivacyPolicy);


export default router;
