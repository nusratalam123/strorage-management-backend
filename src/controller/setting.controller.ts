import { Request, Response, NextFunction } from "express";
import User from "../model/user.model";
import bcrypt from "bcrypt";


//change password based on Email
export const changedPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { email, newPassword, confirmPassword } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("No user found with this email");
      }
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      }
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
        await User.updateOne(
          { email }, 
          { $set: { password: hashedPassword } },
        );
  
      res.status(200).json({
        message: "Password has been changed successfully",
      });
    } catch (err: any) {
      next(err);
    }
  };

// Terms and Conditions
export const getTermsAndConditions = (req: Request, res: Response) => {
  const termsAndConditions = `
    **Terms and Conditions**
    
    1. Introduction
       Welcome to our service. By using our platform, you agree to these terms.

    2. Use of Service
       You must follow all applicable laws and regulations.

    3. Account Responsibility
       Users are responsible for their account security and activity.

    4. Termination
       We reserve the right to suspend or terminate accounts violating these terms.

    5. Changes to Terms
       We may update these terms at any time.

    Contact us for any queries.
  `;

  res.status(200).json({ 
    title: "Terms and Conditions", 
    content: termsAndConditions 
});
};

// About Us
export const getAboutUs = (req: Request, res: Response) => {
  const aboutUs = `
    **About Us**

    Welcome to our platform! Our goal is to provide the best experience for managing files efficiently.
    
    We aim to simplify storage and improve productivity.

    Contact us for any queries.
  `;

  res.status(200).json({ 
    title: "About Us", 
    content: aboutUs 
});
};

// Privacy Policy
export const getPrivacyPolicy = (req: Request, res: Response) => {
  const privacyPolicy = `
    **Privacy Policy**
    
    1. Information Collection
       We collect minimal data required for providing our service.

    2. Data Usage
       Your data is used only to improve your experience.

    3. Data Security
       We implement strict security measures to protect your information.

    4. Third-Party Sharing
       We do not share your data with third parties without consent.

    5. Changes to Policy
       This policy may be updated periodically.

    Contact us for any queries.
  `;

  res.status(200).json({ 
    title: "Privacy Policy", 
    content: privacyPolicy 
});
};
