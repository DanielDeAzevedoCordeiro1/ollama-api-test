export interface User {
  id: string,
  name: string,
  email: string,
  password: string,
  role: Role,
};

export type Role = 'user' | 'premium'

export interface UserRequest {
  name: string,
  email: string,
  password: string,
  role: Role,
};

export interface UserResponse {
  id: string
  name: string,
  email: string,
  role: Role,
};