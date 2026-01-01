import bcrypt from 'bcryptjs';
import { HttpException } from '@packages/shared-utils/src/errors/http-exception';
import { v4 as uuid } from 'uuid';

import { signAccessToken, signRefreshToken } from '../../config/jwt';
import { emailService } from '../../services/email.service';
import { smsService } from '../../services/sms.service';

import { UserModel } from './auth.model';

export class AuthService {
  async register(name: string, email: string, phoneNumber: string, password: string) {
    // Cek email / telpon sudah terdaftar
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (existingUser) {
      throw new HttpException(400, 'Email atau nomor telepon sudah terdaftar.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generete OTP & token
    const phoneOtp: string = Math.floor(100000 + Math.random() * 900000).toString();
    const emailVerificationToken: string = uuid();
    const user = await UserModel.create({
      name,
      email,
      phoneNumber,
      password: hashedPassword,
      emailVerificationToken,
      emailVerificationExpiredAt: new Date(Date.now() + 86400000),
      phoneOtp: await bcrypt.hash(phoneOtp, 10),
      phoneOtpExpiredAt: new Date(Date.now() + 300000),
      isEmailVerified: false,
      isPhoneVerified: false,
    });

    try {
      await emailService.sendVerification(name, email, emailVerificationToken);
      await smsService.sendOtp(phoneNumber, phoneOtp);
    } catch (err) {
      await UserModel.deleteOne({ _id: user._id });
      throw new HttpException(500, `Registrasi gagal ${err}`);
    }

    const { password: _, phoneOtp: __, ...data } = user.toObject();

    return data;
  }

  async login(identifier: string, password: string) {
    const existingUser = await UserModel.findOne({
      $or: [{ email: identifier }, { phoneNumber: identifier }],
    });

    if (!existingUser) throw new HttpException(401, 'Email / nomor telepon atau password salah.');

    const isPasswordValid: boolean = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordValid) throw new HttpException(401, 'Email / nomor telepon atau password salah');

    if (!existingUser.isEmailVerified) throw new HttpException(403, 'Email belum diverifikasi');

    if (!existingUser.isPhoneVerified)
      throw new HttpException(403, 'Nomor telepon belum diverifikasi');

    const payload = {
      userId: String(existingUser._id),
      email: existingUser.email,
      role: existingUser.role,
    };

    const accessToken = signAccessToken(payload) as string;
    const refreshToken = signRefreshToken(payload) as string;

    existingUser.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 86400000),
    });

    await existingUser.save();

    return { accessToken, refreshToken };
  }

  async verifyEmail(token: any) {
    const user = await UserModel.findOne({ emailVerificationToken: token });
    if (!user) throw new HttpException(400, 'Token invalid');

    user.isEmailVerified = true;
    user.emailVerificationToken = '';

    await user.save();
  }

  async verifyPhone(phone: string, otp: string) {
    const user = await UserModel.findOne({
      phoneNumber: phone,
    });

    if (!user || !user.phoneOtp) {
      throw new HttpException(400, 'OTP invalid atau sudah expired');
    }

    const isOtpValid = await bcrypt.compare(otp, user.phoneOtp);

    if (!isOtpValid) {
      throw new HttpException(400, 'OTP invalid atau sudah expired');
    }
    user.isPhoneVerified = true;
    user.phoneOtp = null;
    user.phoneOtpExpiredAt = null;

    await user.save();
  }

  async resendPhoneOtp(phoneNumber: string) {
    const user = await UserModel.findOne({ phoneNumber });

    if (!user) {
      return;
    }

    if (user?.isPhoneVerified) {
      throw new HttpException(400, 'Nomor telepon sudah terverifikasi');
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    user.phoneOtp = await bcrypt.hash(newOtp, 10);
    user.phoneOtpExpiredAt = new Date(Date.now() + 5 * 60 * 1000); // 5 menit

    await user.save();

    await smsService.sendOtp(phoneNumber, newOtp);
  }

  async refresh(refreshToken: string) {
    const user = await UserModel.findOne({
      'refreshTokens.token': refreshToken,
    });

    if (!user) throw new Error('Invalid refresh token');

    // Ambil token
    const storedToken = user.refreshTokens.find((rt) => rt.token === refreshToken);

    if (!storedToken) throw new Error('Invalid refresh token');

    // Cek expired
    if (storedToken.expiresAt < new Date()) {
      user.refreshTokens.pull({ token: refreshToken });
      await user.save();

      throw new Error('Refresh token expired');
    }

    // Hapus refresh token lama
    user.refreshTokens.pull({ token: refreshToken });

    const payload = {
      userId: String(user._id),
      email: user.email,
      role: user.role,
    };

    const newAccessToken = signAccessToken(payload) as string;
    const newRefreshToken = signRefreshToken(payload) as string;

    user.refreshTokens.push({
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    await user.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string) {
    await UserModel.updateOne(
      { 'refreshTokens.token': refreshToken },
      { $pull: { refreshTokens: { token: refreshToken } } },
    );
  }
}
