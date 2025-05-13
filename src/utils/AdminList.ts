interface AdminList {
  email: string;
  userName: string;
  password: string;
  role: string;
  fullName: string;
  contactNumber: string;
  isEmailVerified: boolean;
}

export const AdminUserList: AdminList[] = [
  {
    fullName: "ShreyashSalian",
    email: "admin@gmail.com",
    password: "Admin@123",
    userName: "ShreyashSalian",
    role: "admin",
    contactNumber: "1234567890",
    isEmailVerified: true,
  },
  {
    fullName: "Admin Admin",
    email: "admin123@gmail.com",
    userName: "AdminAdmin",
    password: "Admin@123",
    role: "admin",
    contactNumber: "987654321",
    isEmailVerified: true,
  },
];
