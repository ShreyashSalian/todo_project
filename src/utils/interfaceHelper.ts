import express from "express";
export interface LoginBody {
  userNameOrEmail: string;
  password: string;
}

export interface TodoBody {
  title: string;
  description: string;
  status: string;
  priority: string;
  dueDate: Date;
  assignedTo: string;
}

export interface TodoSearchBody {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
  search: string;
}

export const allowedFieldsByRole = {
  admin: ["title", "description", "priority", "status", "duedate"],
  user: ["title", "description"],
};

export const filterFields = (data: any, allowedFields: string[]) => {
  const filtered: any = {};
  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      filtered[key] = data[key];
    }
  }
  return filtered;
};

export interface CommentBody {
  todoId: string;
  title: string;
  description: string;
}
