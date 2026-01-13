import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { RolesGuard } from '@rbac-task-system/auth';
import {
    UserEntity,
    OrganizationEntity,
    TaskEntity,
    AuditLogEntity,
} from './entities';
import { PublicAuthGuard } from './auth/public-auth.guard';
import { AppController } from './app.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRoot({
            type: 'sqlite',
            database: 'database.sqlite',
            entities: [UserEntity, OrganizationEntity, TaskEntity, AuditLogEntity],
            synchronize: true, // Only for development
            logging: false,
        }),
        AuthModule,
        TasksModule,
    ],
    controllers: [AppController],
    providers: [
        Reflector,
        {
            provide: APP_GUARD,
            useClass: PublicAuthGuard,
        },
        {
            provide: APP_GUARD,
            useFactory: (reflector: Reflector) => new RolesGuard(reflector),
            inject: [Reflector],
        },
    ],
})
export class AppModule { }
