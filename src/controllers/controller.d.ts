export interface User {
  username: string;
  email: string;
  password: string;
  confirmPassword?:string;
  avatar: string;
}

export interface Group {
  name: string;
  avatar: string;
  users: Array<User>;
}