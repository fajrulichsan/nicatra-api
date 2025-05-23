import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter; 
  private readonly logger = new Logger(EmailService.name);

  // Hardcode kredensial email
  private readonly emailUser = 'smapayakumbuh1@gmail.com'; 
  private readonly emailPass = 'rlzc ubtg oqaw ygvl'; 

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.emailUser,
        pass: this.emailPass,
      },
      logger: false, 
      debug: false, 
    });
    
  }

  public async sendGensetStatus(gensetId: string, station: string, voltage: number, current: number, power: number, recipient : string): Promise<void> {
    const subject = `Status Terbaru Genset ${gensetId}`;

    const html = `
      <p>Pengguna Yang Terhormat,</p>
      <p>Berikut adalah status terkini pada stasiun ${station} dengan genset ID ${gensetId}</p>
      <ul>
          <li><strong>Voltage:</strong> ${voltage} Volt</li>
          <li><strong>Arus:</strong> ${current} Ampere</li>
          <li><strong>Daya:</strong> ${power} Watt</li>
      </ul>
      <p>Jika Anda memiliki pertanyaan lebih lanjut mengenai genset atau membutuhkan informasi lebih lanjut, jangan ragu untuk menghubungi tim kami.</p>
      <br />
      <footer style="font-size: 12px; color: #555;">
          <p>Salam Hormat,</p>
          <p>Nicatra System</p>
      </footer>
    `;

    await this.sendEmail(recipient, subject, html); 
}

public async sendAccountApproval(
  userEmail: string,
  userName: string,
  loginUrl?: string
): Promise<void> {
  const subject = 'Akun Anda Telah Disetujui - Nicatra System';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #28a745; margin-bottom: 10px;">🎉 Selamat! Akun Anda Telah Disetujui</h2>
      </div>
      
      <p>Halo <strong>${userName}</strong>,</p>
      
      <p>Kami dengan senang hati menginformasikan bahwa akun Anda telah berhasil disetujui dan diverifikasi oleh administrator.</p>
      
      <div style="background-color: #e8f5e8; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
        <h3 style="color: #155724; margin-top: 0;">✅ Status Akun Anda:</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li><strong>Status:</strong> Aktif & Terverifikasi</li>
          <li><strong>Akses:</strong> Penuh ke semua fitur sistem</li>
          <li><strong>Email:</strong> ${userEmail}</li>
        </ul>
      </div>
      
      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
        <h3 style="color: #856404; margin-top: 0;">🚀 Langkah Selanjutnya:</h3>
        <p style="margin: 10px 0;">Anda sekarang dapat mengakses sistem dengan menggunakan kredensial yang telah Anda daftarkan sebelumnya.</p>
        ${loginUrl ? `<p><a href="${loginUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Login Sekarang</a></p>` : ''}
      </div>
      
      <div style="background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0;">
        <h3 style="color: #0c5460; margin-top: 0;">📋 Fitur yang Dapat Anda Akses:</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Dashboard monitoring genset</li>
          <li>Laporan status dan performa</li>
          <li>Notifikasi real-time</li>
          <li>Pengaturan profil dan preferensi</li>
        </ul>
      </div>
      
      <p>Jika Anda mengalami kesulitan dalam mengakses akun atau memiliki pertanyaan, jangan ragu untuk menghubungi tim support kami.</p>
      
      <p>Terima kasih atas kesabaran Anda menunggu proses verifikasi.</p>
      
      <br />
      <footer style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px; font-size: 12px; color: #6c757d;">
        <p><strong>Salam Hormat,</strong></p>
        <p><strong>Tim Nicatra System</strong></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 15px 0;">
        <p style="font-size: 11px; color: #999;">
          Email ini dikirim secara otomatis oleh sistem. Mohon jangan membalas email ini.
          <br>
          © ${new Date().getFullYear()} Nicatra System. All rights reserved.
        </p>
      </footer>
    </div>
  `;

  await this.sendEmail(userEmail, subject, html);
}

  private async sendEmail(
    to: string,
    subject: string,
    html: string,
  ): Promise<void> {
    const mailOptions = {
      from: this.emailUser,
      to,
      subject,
      html,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${to} successfully.`);
    } catch (error) {
      this.logger.error(`Error sending email to ${to}: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to send email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
