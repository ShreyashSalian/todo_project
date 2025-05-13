import { checkSchema } from "express-validator";
import { trimInput } from "../utils/function";

export const commentValidation = () => {
  return checkSchema({
    todoId: {
      notEmpty: {
        errorMessage: "Please enter the todos ID.",
      },
    },
    title: {
      notEmpty: {
        errorMessage: "Please enter the title for comment",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    description: {
      notEmpty: {
        errorMessage: "Please enter the description",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
  });
};
