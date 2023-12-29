export interface IUserRegister {
  displayName: string;
  password: string;
  email: string;
  subscription: string;
}

export interface IUserLogin {
  email: string;
  password: string;
}
