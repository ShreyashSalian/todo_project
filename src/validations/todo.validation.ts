import { checkSchema } from "express-validator";
import { trimInput } from "../utils/function";

export const todosValidation = () => {
  return checkSchema({
    title: {
      notEmpty: {
        errorMessage: "Please enter the title",
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
    status: {
      notEmpty: {
        errorMessage: "Please enter the status",
      },
    },
    priority: {
      notEmpty: {
        errorMessage: "Please enter the status",
      },
    },
    assignedTo: {
      notEmpty: {
        errorMessage: "Please enter the user whom the todos has to be assigned",
      },
    },
    dueDate: {
      notEmpty: {
        errorMessage: "Please enter Duedate",
      },
      custom: {
        options: (value) => {
          const inputDate = new Date(value);
          const now = new Date();
          // Zero out time in both dates to compare only dates
          inputDate.setHours(0, 0, 0, 0);
          now.setHours(0, 0, 0, 0);
          if (inputDate < now) {
            throw new Error("Due date cannot be in the past.");
          }

          return true;
        },
      },
    },
  });
};
