import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column()
  title: string;

  @Column('text')
  body: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ type: 'bigint' })
  recipientId: number;

  @Column({ default: true })
  statusData: boolean;

  // audit fields
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @Column({ default: "SYSTEM" })
  createdBy: string;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @Column({ default: "SYSTEM" })
  updatedBy: string;

  @BeforeInsert()
  generateProfileId() {
      this.id = new Date().valueOf();
  }
}
