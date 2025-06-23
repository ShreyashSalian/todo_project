export interface TodosBody {
  title: string;
  description: string;
  status: string;
  priority: string;
  assignedTo: string;
  dueDate: Date;
}

export interface TodoSearchBody {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
  search: string;
}
