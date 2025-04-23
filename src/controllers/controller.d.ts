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

export type ValidatorHook<T> = (data: T) => {
  isValid: boolean;
  error?: string;
};

export type PreProcessorHook<T,U> = (data: T) => U;
