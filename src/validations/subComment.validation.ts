import { checkSchema } from "express-validator";
import { trimInput } from "../utils/function";

export const subCommentValidation = () => {
  return checkSchema({
    commentId: {
      notEmpty: {
        errorMessage: "Please enter the comment ID.",
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
    message: {
      notEmpty: {
        errorMessage: "Please enter the message",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
  });
};
