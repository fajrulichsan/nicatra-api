import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column()
    name: string;

    @Column()
    nipp: string;

    @Column()
    position: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @Column({ default: false })
    isVerified: boolean;

    @Column({ default: false })
    isAdmin: boolean;

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
