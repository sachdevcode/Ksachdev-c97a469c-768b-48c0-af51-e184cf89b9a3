import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { UserRole } from '@rbac-task-system/data';
import { OrganizationEntity } from './organization.entity';
import { TaskEntity } from './task.entity';

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({
        type: 'varchar',
        enum: UserRole,
        default: UserRole.VIEWER,
    })
    role: UserRole;

    @Column({ type: 'uuid' })
    organizationId: string;

    @ManyToOne(() => OrganizationEntity, (org) => org.users)
    @JoinColumn({ name: 'organizationId' })
    organization: OrganizationEntity;

    @OneToMany(() => TaskEntity, (task) => task.owner)
    tasks: TaskEntity[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
