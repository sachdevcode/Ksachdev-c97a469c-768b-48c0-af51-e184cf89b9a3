import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskEntity, UserEntity, OrganizationEntity, AuditLogEntity } from '../entities';
import { CreateTaskDto, UpdateTaskDto, UserRole } from '@rbac-task-system/data';

@Injectable()
export class TaskService {
    constructor(
        @InjectRepository(TaskEntity)
        private taskRepository: Repository<TaskEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @InjectRepository(OrganizationEntity)
        private organizationRepository: Repository<OrganizationEntity>,
        @InjectRepository(AuditLogEntity)
        private auditRepository: Repository<AuditLogEntity>,
    ) { }

    private async logAudit(
        userId: string,
        action: string,
        resource: string,
        resourceId: string,
        metadata?: Record<string, any>,
    ) {
        const auditLog = this.auditRepository.create({
            userId,
            action,
            resource,
            resourceId,
            metadata,
        });
        await this.auditRepository.save(auditLog);
    }

    async create(createTaskDto: CreateTaskDto, user: any): Promise<TaskEntity> {
        const task = this.taskRepository.create({
            ...createTaskDto,
            ownerId: user.id,
            organizationId: user.organizationId,
            status: createTaskDto.status || 'todo',
        });

        const savedTask = await this.taskRepository.save(task);

        await this.logAudit(user.id, 'CREATE', 'task', savedTask.id, {
            title: savedTask.title,
        });

        return savedTask;
    }

    async findAll(user: any): Promise<TaskEntity[]> {
        const currentUser = await this.userRepository.findOne({
            where: { id: user.id },
            relations: ['organization'],
        });

        let tasks: TaskEntity[];

        if (currentUser.role === UserRole.OWNER) {
            // Owners can see all tasks
            tasks = await this.taskRepository.find({
                relations: ['owner', 'organization'],
            });
        } else if (currentUser.role === UserRole.ADMIN) {
            // Admins can see tasks in their organization and child organizations
            const org = await this.organizationRepository.findOne({
                where: { id: currentUser.organizationId },
                relations: ['children'],
            });

            const orgIds = [org.id, ...org.children.map((child) => child.id)];

            tasks = await this.taskRepository
                .createQueryBuilder('task')
                .leftJoinAndSelect('task.owner', 'owner')
                .leftJoinAndSelect('task.organization', 'organization')
                .where('task.organizationId IN (:...orgIds)', { orgIds })
                .getMany();
        } else {
            // Viewers can only see their own tasks
            tasks = await this.taskRepository.find({
                where: { ownerId: user.id },
                relations: ['owner', 'organization'],
            });
        }

        await this.logAudit(user.id, 'LIST', 'task', 'all', {
            count: tasks.length,
        });

        return tasks;
    }

    async findOne(id: string, user: any): Promise<TaskEntity> {
        const task = await this.taskRepository.findOne({
            where: { id },
            relations: ['owner', 'organization'],
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        const canAccess = await this.canAccessTask(task, user);
        if (!canAccess) {
            throw new ForbiddenException('Access denied');
        }

        await this.logAudit(user.id, 'READ', 'task', id);

        return task;
    }

    async update(
        id: string,
        updateTaskDto: UpdateTaskDto,
        user: any,
    ): Promise<TaskEntity> {
        const task = await this.findOne(id, user);

        const canModify = await this.canModifyTask(task, user);
        if (!canModify) {
            throw new ForbiddenException('Cannot modify this task');
        }

        Object.assign(task, updateTaskDto);
        const updatedTask = await this.taskRepository.save(task);

        await this.logAudit(user.id, 'UPDATE', 'task', id, updateTaskDto);

        return updatedTask;
    }

    async remove(id: string, user: any): Promise<void> {
        const task = await this.findOne(id, user);

        const canModify = await this.canModifyTask(task, user);
        if (!canModify) {
            throw new ForbiddenException('Cannot delete this task');
        }

        await this.taskRepository.remove(task);

        await this.logAudit(user.id, 'DELETE', 'task', id, {
            title: task.title,
        });
    }

    private async canAccessTask(task: TaskEntity, user: any): Promise<boolean> {
        const currentUser = await this.userRepository.findOne({
            where: { id: user.id },
        });

        if (currentUser.role === UserRole.OWNER) {
            return true;
        }

        if (currentUser.role === UserRole.ADMIN) {
            const org = await this.organizationRepository.findOne({
                where: { id: currentUser.organizationId },
                relations: ['children'],
            });

            const orgIds = [org.id, ...org.children.map((child) => child.id)];
            return orgIds.includes(task.organizationId);
        }

        return task.ownerId === user.id;
    }

    private async canModifyTask(task: TaskEntity, user: any): Promise<boolean> {
        const currentUser = await this.userRepository.findOne({
            where: { id: user.id },
        });

        if (currentUser.role === UserRole.OWNER) {
            return true;
        }

        if (currentUser.role === UserRole.ADMIN) {
            const org = await this.organizationRepository.findOne({
                where: { id: currentUser.organizationId },
                relations: ['children'],
            });

            const orgIds = [org.id, ...org.children.map((child) => child.id)];
            return orgIds.includes(task.organizationId);
        }

        return task.ownerId === user.id;
    }

    async getAuditLogs(user: any): Promise<AuditLogEntity[]> {
        const currentUser = await this.userRepository.findOne({
            where: { id: user.id },
        });

        if (
            currentUser.role !== UserRole.OWNER &&
            currentUser.role !== UserRole.ADMIN
        ) {
            throw new ForbiddenException('Access denied');
        }

        return this.auditRepository.find({
            order: { timestamp: 'DESC' },
            take: 100,
        });
    }
}
