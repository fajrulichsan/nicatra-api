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
