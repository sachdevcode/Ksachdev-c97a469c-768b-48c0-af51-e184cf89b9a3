import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { OrganizationEntity } from './organization.entity';

@Entity('tasks')
export class TaskEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ default: 'todo' })
    status: string;

    @Column({ default: 'other' })
    category: string;

    @Column({ type: 'uuid' })
    ownerId: string;

    @ManyToOne(() => UserEntity, (user) => user.tasks)
    @JoinColumn({ name: 'ownerId' })
    owner: UserEntity;

    @Column({ type: 'uuid' })
    organizationId: string;

    @ManyToOne(() => OrganizationEntity, (org) => org.tasks)
    @JoinColumn({ name: 'organizationId' })
    organization: OrganizationEntity;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
