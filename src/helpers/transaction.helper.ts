export interface TransactionBody {
  amount: number;
  type: string;
  category: string;
  description: string;
  date: string;
}
export interface TransactionSearchBody {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: string;
  search: string;
}
