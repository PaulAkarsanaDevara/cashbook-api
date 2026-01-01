import { Router } from 'express';

import { container } from '../../shared/container';

const router = Router();
const controller = container.authController;

router.post('/register', controller.register);
router.post('/login', controller.login);
router.get('/verify-email', controller.verifyEmail);
router.post('/verify-phone', controller.verifyPhone);
router.post('/resend-otp', controller.resenPhoneOtp);
router.post('/refresh', controller.refresh);
router.post('/logout', controller.logout);

export default router;
