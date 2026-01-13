import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity, OrganizationEntity, TaskEntity } from '../apps/api/src/entities';
import { UserRole, TaskStatus, TaskCategory } from '@rbac-task-system/data';

async function seed() {
    const dataSource = new DataSource({
        type: 'sqlite',
        database: 'database.sqlite',
        entities: [UserEntity, OrganizationEntity, TaskEntity],
        synchronize: true,
    });

    await dataSource.initialize();

    const orgRepo = dataSource.getRepository(OrganizationEntity);
    const userRepo = dataSource.getRepository(UserEntity);
    const taskRepo = dataSource.getRepository(TaskEntity);

    // Clear existing data
    await taskRepo.clear();
    await userRepo.clear();
    await orgRepo.clear();

    // Create organizations
    const parentOrg = orgRepo.create({
        id: 'org-1',
        name: 'Acme Corporation',
        parentId: null,
    });
    await orgRepo.save(parentOrg);

    const childOrg = orgRepo.create({
        id: 'org-2',
        name: 'Acme Engineering',
        parentId: 'org-1',
    });
    await orgRepo.save(childOrg);

    // Create users
    const hashedPassword = await bcrypt.hash('password', 10);

    const owner = userRepo.create({
        email: 'owner@example.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Owner',
        role: UserRole.OWNER,
        organizationId: 'org-1',
    });
    await userRepo.save(owner);

    const admin = userRepo.create({
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Jane',
        lastName: 'Admin',
        role: UserRole.ADMIN,
        organizationId: 'org-1',
    });
    await userRepo.save(admin);

    const viewer = userRepo.create({
        email: 'viewer@example.com',
        password: hashedPassword,
        firstName: 'Bob',
        lastName: 'Viewer',
        role: UserRole.VIEWER,
        organizationId: 'org-2',
    });
    await userRepo.save(viewer);

    // Create sample tasks
    const tasks = [
        {
            title: 'Complete project documentation',
            description: 'Write comprehensive docs for the RBAC system',
            status: TaskStatus.TODO,
            category: TaskCategory.WORK,
            ownerId: owner.id,
            organizationId: 'org-1',
        },
        {
            title: 'Review pull requests',
            description: 'Review and merge pending PRs',
            status: TaskStatus.IN_PROGRESS,
            category: TaskCategory.WORK,
            ownerId: admin.id,
            organizationId: 'org-1',
        },
        {
            title: 'Update dependencies',
            description: 'Update npm packages to latest versions',
            status: TaskStatus.DONE,
            category: TaskCategory.WORK,
            ownerId: owner.id,
            organizationId: 'org-1',
        },
        {
            title: 'Team meeting preparation',
            description: 'Prepare slides for weekly team meeting',
            status: TaskStatus.TODO,
            category: TaskCategory.WORK,
            ownerId: viewer.id,
            organizationId: 'org-2',
        },
        {
            title: 'Personal: Learn TypeScript',
            description: 'Complete TypeScript course on Udemy',
            status: TaskStatus.IN_PROGRESS,
            category: TaskCategory.PERSONAL,
            ownerId: viewer.id,
            organizationId: 'org-2',
        },
    ];

    for (const taskData of tasks) {
        const task = taskRepo.create(taskData);
        await taskRepo.save(task);
    }

    console.log('✅ Database seeded successfully!');
    console.log('\n📧 Demo Credentials:');
    console.log('Owner: owner@example.com / password');
    console.log('Admin: admin@example.com / password');
    console.log('Viewer: viewer@example.com / password');

    await dataSource.destroy();
}

seed().catch(console.error);
