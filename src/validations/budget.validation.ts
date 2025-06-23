import { checkSchema } from "express-validator";
import { trimInput } from "../utils/function";

export const budgetValidation = () => {
  return checkSchema({
    amount: {
      notEmpty: {
        errorMessage: "Please enter the amount for transaction",
      },
      customSanitizer: {
        options: trimInput,
      },
    },

    category: {
      notEmpty: {
        errorMessage: "Please enter the date for transaction.",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    year: {
      notEmpty: {
        errorMessage: "Please enter the year for transaction.",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    month: {
      notEmpty: {
        errorMessage: "Please enter the month for transaction.",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
  });
};
