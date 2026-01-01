import { Request, Response } from 'express';

import { AuthService } from './auth.service';

export class AuthController {
  constructor(private service: AuthService) {}

  register = async (req: Request, res: Response) => {
    const { name, email, phoneNumber, password } = req.body;
    const data = await this.service.register(name, email, phoneNumber, password);
    res.status(201).json({
      message: 'Registrasi berhasil. Silakan verifikasi email dan nomor telepon.',
      data: data,
    });
  };

  login = async (req: Request, res: Response) => {
    const dto = req.body;
    const { accessToken, refreshToken } = await this.service.login(dto.email, dto.password);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/refresh',
    });

    res.json({ accessToken });
  };

  verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.query;
    await this.service.verifyEmail(token);
    res.json({ message: "Email berhasil diverifikasi'" });
  };

  verifyPhone = async (req: Request, res: Response) => {
    const { phone, otp } = req.body;
    await this.service.verifyPhone(phone, otp);
    res.json({ message: 'Nomor telepon berhasil diverifikasi' });
  };

  resenPhoneOtp = async (req: Request, res: Response) => {
    const { phoneNumber } = req.body;
    await this.service.resendPhoneOtp(phoneNumber);
    res.json({ message: `Kode OTP untuk No ${phoneNumber} berhasil dikirim ulang.` });
  };

  refresh = async (req: Request, res: Response) => {
    const token = req.cookies.refreshToken;
    if (!token) {
      res.status(401).json({ message: 'Unauthorized' });
    }

    const tokens = await this.service.refresh(token);
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/api/auth/refresh',
    });

    res.json({ accessToken: tokens.accessToken });
  };

  logout = async (req: Request, res: Response) => {
    await this.service.logout(req.body.refreshToken);
    res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
    res.status(204).send();
  };
}
