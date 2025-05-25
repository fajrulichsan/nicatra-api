import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';

@Entity()
export class Station {
  @PrimaryGeneratedColumn({type: 'bigint'})
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 10, unique: true })
  code: string;

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
