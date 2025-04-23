export interface User {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
  avatar: string;
}

export interface Group {
  name: string;
  avatar: string;
  users: Array<User> | string[];
}

export interface pagination {
  limit: number;
  page: number;
  skip: number;
}

export type sort<T> = {
  [key in keyof T]: 1 | -1;
};

export type filter = {

}
