import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TaskService } from './tasks.service';
import { TaskEntity, UserEntity, OrganizationEntity, AuditLogEntity } from '../entities';
import { UserRole } from '@rbac-task-system/data';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

describe('TaskService', () => {
    let service: TaskService;
    let taskRepo: any;
    let userRepo: any;
    let orgRepo: any;
    let auditRepo: any;

    const mockUser = { id: 'user-1', role: UserRole.VIEWER, organizationId: 'org-1' };
    const mockAdmin = { id: 'admin-1', role: UserRole.ADMIN, organizationId: 'org-1' };
    const mockOwner = { id: 'owner-1', role: UserRole.OWNER };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TaskService,
                {
                    provide: getRepositoryToken(TaskEntity),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        find: jest.fn(),
                        findOne: jest.fn(),
                        remove: jest.fn(),
                        createQueryBuilder: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(UserEntity),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(OrganizationEntity),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(AuditLogEntity),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        find: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<TaskService>(TaskService);
        taskRepo = module.get(getRepositoryToken(TaskEntity));
        userRepo = module.get(getRepositoryToken(UserEntity));
        orgRepo = module.get(getRepositoryToken(OrganizationEntity));
        auditRepo = module.get(getRepositoryToken(AuditLogEntity));
    });

    describe('findAll', () => {
        it('should return only own tasks for VIEWER', async () => {
            userRepo.findOne.mockResolvedValue(mockUser);
            taskRepo.find.mockResolvedValue([{ id: 'task-1', ownerId: 'user-1' }]);

            const result = await service.findAll(mockUser);

            expect(result).toHaveLength(1);
            expect(taskRepo.find).toHaveBeenCalledWith(expect.objectContaining({
                where: { ownerId: 'user-1' }
            }));
        });

        it('should return all tasks for OWNER', async () => {
            userRepo.findOne.mockResolvedValue(mockOwner);
            taskRepo.find.mockResolvedValue([{ id: 'task-1' }, { id: 'task-2' }]);

            const result = await service.findAll(mockOwner);

            expect(result).toHaveLength(2);
            expect(taskRepo.find).toHaveBeenCalledWith(expect.objectContaining({
                relations: ['owner', 'organization']
            }));
        });
    });

    describe('findOne', () => {
        it('should throw NotFound if task does not exist', async () => {
            taskRepo.findOne.mockResolvedValue(null);
            await expect(service.findOne('999', mockUser)).rejects.toThrow(NotFoundException);
        });

        it('should allow access to own task for VIEWER', async () => {
            const task = { id: 'task-1', ownerId: 'user-1', organizationId: 'org-1' };
            taskRepo.findOne.mockResolvedValue(task);
            userRepo.findOne.mockResolvedValue(mockUser);

            const result = await service.findOne('task-1', mockUser);
            expect(result).toEqual(task);
        });

        it('should deny access to others tasks for VIEWER', async () => {
            const task = { id: 'task-1', ownerId: 'other-user', organizationId: 'org-1' };
            taskRepo.findOne.mockResolvedValue(task);
            userRepo.findOne.mockResolvedValue(mockUser);

            await expect(service.findOne('task-1', mockUser)).rejects.toThrow(ForbiddenException);
        });
    });
});
