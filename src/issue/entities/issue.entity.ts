import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';

@Entity()
export class Issue {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 100 })
  stationCode: string;

  @Column()
  status: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

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
