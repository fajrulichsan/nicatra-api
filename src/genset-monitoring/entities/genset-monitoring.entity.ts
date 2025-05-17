import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';

@Entity('genset_monitoring')
export class GensetMonitoring {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @Column()
    gensetId: string;

    @Column({ type: 'float' })
    voltage: number;

    @Column({ type: 'float' })
    currentA: number;

    @Column({ type: 'float' })
    power: number;

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
