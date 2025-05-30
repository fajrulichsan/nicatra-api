import { Injectable, HttpException, HttpStatus, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface EmailJob {
  id: string;
  to: string;
  subject: string;
  html: string;
  attempts: number;
  createdAt: Date;
  scheduledAt?: Date;
}

@Injectable()
export class EmailService implements OnModuleInit, OnModuleDestroy {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);
  private emailQueue: EmailJob[] = [];
  private isProcessing = false;
  private processingInterval: NodeJS.Timeout;
  private readonly maxRetries = 3;
  private readonly processInterval = 5000; // 5 detik

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

  onModuleInit() {
    // Mulai processing queue saat module diinisialisasi
    this.startQueueProcessor();
    this.logger.log('Email queue processor started');
  }

  onModuleDestroy() {
    // Stop processing saat module di-destroy
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }
    this.logger.log('Email queue processor stopped');
  }

  // Method untuk menambah email ke queue
  private addToQueue(to: string, subject: string, html: string, delayMinutes = 0): void {
    const job: EmailJob = {
      id: this.generateJobId(),
      to,
      subject,
      html,
      attempts: 0,
      createdAt: new Date(),
      scheduledAt: delayMinutes > 0 ? new Date(Date.now() + delayMinutes * 60000) : undefined
    };

    this.emailQueue.push(job);
    this.logger.log(`Email added to queue: ${job.id} for ${to}`);
  }

  // Generate unique job ID
  private generateJobId(): string {
    return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Processor queue yang berjalan di background
  private startQueueProcessor(): void {
    this.processingInterval = setInterval(async () => {
      if (!this.isProcessing && this.emailQueue.length > 0) {
        await this.processQueue();
      }
    }, this.processInterval);
  }

  // Process email queue
  private async processQueue(): Promise<void> {
    this.isProcessing = true;
    
    try {
      // Ambil email yang siap diproses (tidak ada delay atau sudah waktunya)
      const readyJobs = this.emailQueue.filter(job => 
        !job.scheduledAt || job.scheduledAt <= new Date()
      );

      if (readyJobs.length === 0) {
        this.isProcessing = false;
        return;
      }

      // Process maksimal 5 email sekaligus untuk menghindari spam
      const jobsToProcess = readyJobs.slice(0, 5);
      
      for (const job of jobsToProcess) {
        try {
          await this.sendEmailDirectly(job.to, job.subject, job.html);
          
          // Hapus dari queue jika berhasil
          this.removeJobFromQueue(job.id);
          this.logger.log(`Email sent successfully: ${job.id}`);
          
        } catch (error) {
          job.attempts++;
          
          if (job.attempts >= this.maxRetries) {
            // Hapus jika sudah mencapai max retry
            this.removeJobFromQueue(job.id);
            this.logger.error(`Email failed permanently: ${job.id} after ${job.attempts} attempts`);
          } else {
            // Jadwalkan retry dengan delay eksponensial
            const delayMinutes = Math.pow(2, job.attempts); // 2, 4, 8 menit
            job.scheduledAt = new Date(Date.now() + delayMinutes * 60000);
            this.logger.warn(`Email retry scheduled: ${job.id}, attempt ${job.attempts}, retry in ${delayMinutes} minutes`);
          }
        }

        // Delay antar email untuk menghindari rate limiting
        await this.sleep(1000);
      }
      
    } catch (error) {
      this.logger.error('Error processing email queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Helper method untuk sleep
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Remove job dari queue
  private removeJobFromQueue(jobId: string): void {
    this.emailQueue = this.emailQueue.filter(job => job.id !== jobId);
  }

  // Send email langsung (untuk internal use)
  private async sendEmailDirectly(to: string, subject: string, html: string): Promise<void> {
    const mailOptions = {
      from: this.emailUser,
      to,
      subject,
      html,
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Public methods untuk mengirim email (masuk ke queue)
  public async sendGensetStatus(
    gensetId: string, 
    station: string, 
    voltage: number, 
    current: number, 
    power: number, 
    recipient: string
  ): Promise<void> {
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

    // Tambahkan ke queue
    this.addToQueue(recipient, subject, html);
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

    // Tambahkan ke queue dengan delay 1 menit untuk email approval
    this.addToQueue(userEmail, subject, html, 1);
  }

  // Method untuk mendapatkan status queue (opsional, untuk monitoring)
  public getQueueStatus(): { total: number; pending: number; scheduled: number } {
    const now = new Date();
    const pending = this.emailQueue.filter(job => !job.scheduledAt || job.scheduledAt <= now).length;
    const scheduled = this.emailQueue.filter(job => job.scheduledAt && job.scheduledAt > now).length;
    
    return {
      total: this.emailQueue.length,
      pending,
      scheduled
    };
  }

  // Method untuk mengirim email dengan prioritas tinggi (langsung kirim)
  public async sendUrgentEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      await this.sendEmailDirectly(to, subject, html);
      this.logger.log(`Urgent email sent immediately to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send urgent email to ${to}: ${error.message}`);
      // Jika gagal, masukkan ke queue sebagai fallback
      this.addToQueue(to, subject, html);
      throw new HttpException(
        'Failed to send urgent email, added to queue for retry',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
