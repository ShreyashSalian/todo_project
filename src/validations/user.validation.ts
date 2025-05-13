import { checkSchema, Meta } from "express-validator";
import { User } from "../models/user.model";
import fs from "fs";
import { trimInput } from "../utils/function";

// Utility function to delete files if validation fails
const deleteFile = (file: Express.Multer.File | undefined) => {
  if (file) {
    fs.unlinkSync(file.path);
  }
};

// Allowed file types and maximum size
const allowedMimeTypes = ["image/jpeg", "image/png"];
const maxSize = 2 * 1024 * 1024; // 2MB

export const userValidation = () => {
  return checkSchema({
    fullName: {
      notEmpty: {
        errorMessage: "Please enter the full name",
      },
      matches: {
        options: [/^[a-zA-Z\s]+$/], // Allows only letters and spaces
        errorMessage: "Please enter a valid full name.",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    email: {
      notEmpty: {
        errorMessage: "Please enter the email.",
      },
      isEmail: {
        errorMessage: "Please enter a valid email.",
      },
      custom: {
        options: (value: string) => {
          return new Promise<boolean>((resolve, reject) => {
            User.findOne({ where: { email: value } })
              .then((user) => {
                if (user) {
                  reject("The email already exists.");
                } else {
                  resolve(true);
                }
              })
              .catch(() => reject("Error while checking email"));
          });
        },
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    password: {
      notEmpty: {
        errorMessage: "Please enter the password.",
      },
      matches: {
        options: [/^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,}$/],
        errorMessage:
          "Password must be at least 6 characters long, including a number and a special character.",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    confirmPassword: {
      notEmpty: {
        errorMessage: "Please enter the confirm password.",
      },
      customSanitizer: {
        options: trimInput,
      },
      custom: {
        options: (value: string, { req }: Meta): boolean => {
          if (value !== req.body.password) {
            throw new Error("Password and confirm password don't match.");
          }
          return true;
        },
      },
    },
    profileImage: {
      custom: {
        options: (value: unknown, { req }: Meta) => {
          const file = (req.file as Express.Multer.File) || null;

          // Skip validation if no file is uploaded
          if (!file) {
            return true;
          }

          // Check MIME type
          if (!allowedMimeTypes.includes(file.mimetype)) {
            deleteFile(file);
            throw new Error("Only .jpeg and .png formats are allowed.");
          }

          // Check file size
          if (file.size > maxSize) {
            deleteFile(file);
            throw new Error("Image size should not exceed 2MB.");
          }

          return true; // Validation passes
        },
      },
    },
    contactNumber: {
      notEmpty: {
        errorMessage: "Please enter the Contact Number",
      },
      matches: {
        // Regular expression for Indian mobile numbers
        options: [/^[6-9]\d{9}$/],
        errorMessage:
          "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.",
      },
      custom: {
        options: (value: string) => {
          return new Promise<boolean>((resolve, reject) => {
            User.findOne({ where: { contactNumber: value } })
              .then((user) => {
                if (user) {
                  reject("The contact number already exists.");
                } else {
                  resolve(true);
                }
              })
              .catch(() => reject("Error while checking contact number"));
          });
        },
      },
      customSanitizer: {
        options: trimInput,
      },
    },
  });
};
