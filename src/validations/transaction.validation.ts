import { checkSchema } from "express-validator";
import { trimInput } from "../utils/function";

export const transactionValidation = () => {
  return checkSchema({
    amount: {
      notEmpty: {
        errorMessage: "Please enter the amount for the transaction.",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    type: {
      notEmpty: {
        errorMessage: "Please enter the type for the transaction.",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    description: {
      notEmpty: {
        errorMessage: "Please enter the description for the transaction.",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
    date: {
      notEmpty: {
        errorMessage: "Please enter the date",
      },
      // custom:{
      //   options:(value)=>{
      //     const inputDate = new Date(value);
      //     const now = new Date();
      //     inputDate.setHours(0,0,0,0);
      //     now.setHours(0,0,0,0);
      //     if(inputDate < now){
      //       throw new Error()
      //     }
      //   }
      // }
    },
    category: {
      notEmpty: {
        errorMessage: "Please enter the date for transaction.",
      },
      customSanitizer: {
        options: trimInput,
      },
    },
  });
};
