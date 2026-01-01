import nodemailer from 'nodemailer';

class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendVerification(name: string, email: string, token: string) {
    const verifyLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}&email=${email}`;

    await this.transporter.sendMail({
      from: `<${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Konfirmasi Email Anda – Satu Langkah Lagi 🚀',
      html: `
      <div style="font-family: Arial, Helvetica, sans-serif; background-color:#f4f6f8; padding:24px;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; padding:32px;">
          
          <h2 style="color:#2f80ed; margin-top:0;">
            Verifikasi Email Anda
          </h2>

          <p style="font-size:15px; color:#333;">
            Halo ${name} 👋<br />
            Terima kasih telah mendaftar di <strong>Cashbook App</strong>.
          </p>

          <p style="font-size:15px; color:#333;">
            Untuk mengaktifkan akun Anda dan memastikan keamanan data, silakan klik tombol di bawah ini:
          </p>

          <div style="text-align:center; margin:32px 0;">
            <a href="${verifyLink}">${verifyLink}</a>
            <br/>
            <a
              href="${verifyLink}"
              style="
                background-color:#2f80ed;
                color:#ffffff;
                padding:14px 28px;
                text-decoration:none;
                border-radius:6px;
                font-weight:bold;
                display:inline-block;
              "
            >
              Verifikasi Email
            </a>
          </div>

          <p style="font-size:14px; color:#555;">
            Link verifikasi ini berlaku selama <strong>24 jam</strong>.
            Jika Anda tidak merasa mendaftar di Cashbook App, abaikan email ini.
          </p>

          <hr style="border:none; border-top:1px solid #eaeaea; margin:32px 0;" />

          <p style="font-size:12px; color:#999; text-align:center;">
            © ${new Date().getFullYear()} Cashbook App.<br />
            Email ini dikirim secara otomatis, mohon tidak membalas email ini.
          </p>

        </div>
      </div>
    `,
      // html: `
      //   <h3>Verifikasi Email</h3>
      //   <p>Silakan klik link di bawah untuk verifikasi email:</p>
      //   <a href="${verifyLink}">${verifyLink}</a>
      //   <p>Link berlaku selama 24 jam.</p>
      // `,
    });
  }

  async sendResetPassword(email: string, resetLink: string) {
    await this.transporter.sendMail({
      from: `"No Reply" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Reset Password',
      html: `
        <h3>Reset Password</h3>
        <p>Klik link berikut untuk reset password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Link berlaku selama 15 menit.</p>
      `,
    });
  }
}

export const emailService = new EmailService();
