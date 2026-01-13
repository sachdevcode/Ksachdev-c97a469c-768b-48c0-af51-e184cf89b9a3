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
import { UserEntity } from './user.entity';
import { TaskEntity } from './task.entity';

@Entity('organizations')
export class OrganizationEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'uuid', nullable: true })
    parentId: string | null;

    @ManyToOne(() => OrganizationEntity, (org) => org.children, { nullable: true })
    @JoinColumn({ name: 'parentId' })
    parent: OrganizationEntity | null;

    @OneToMany(() => OrganizationEntity, (org) => org.parent)
    children: OrganizationEntity[];

    @OneToMany(() => UserEntity, (user) => user.organization)
    users: UserEntity[];

    @OneToMany(() => TaskEntity, (task) => task.organization)
    tasks: TaskEntity[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
