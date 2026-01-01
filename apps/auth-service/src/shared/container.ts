import { AuthController } from '../modules/auth/auth.controller';
import { AuthService } from '../modules/auth/auth.service';

const authService: AuthService = new AuthService();
const authController: AuthController = new AuthController(authService);

export const container = {
  authController,
};
