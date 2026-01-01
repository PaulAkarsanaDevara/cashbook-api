class SmsService {
  async sendOtp(phoneNumber: string, otp: string) {
    // SIMULASI (development)
    if (process.env.NODE_ENV !== 'production') {
      console.log(`📱 Kode OTP (${otp}) untuk No: ${phoneNumber} berhasil dikirimkan`);
      return;
    }
  }
}

export const smsService = new SmsService();
