export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  image?: string;
  callbackURL?: string;
}
