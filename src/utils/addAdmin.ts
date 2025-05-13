import { User } from "../models/user.model";
import { AdminUserList } from "./AdminList";

export const addAdmin = async (): Promise<void> => {
  try {
    for (let user of AdminUserList) {
      const userExist = await User.findOne({
        $and: [
          {
            email: user.email,
          },
          {
            userName: user.userName,
          },
        ],
      });
      if (!userExist) {
        const createdUser = await User.create({
          fullName: user.fullName,
          password: user.password,
          userName: user.userName,
          contactNumber: user.contactNumber,
          role: user.role,
          isEmailVerified: user.isEmailVerified,
          email: user.email,
        });
        console.log(`Admin user ${user.fullName} has been added successfully.`);
      }
    }
  } catch (err: any) {
    console.log(`Error while adding admin : ${err}`);
  }
};
