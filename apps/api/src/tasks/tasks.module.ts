import { Module } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskEntity, UserEntity, OrganizationEntity, AuditLogEntity } from '../entities';

@Module({
    imports: [TypeOrmModule.forFeature([TaskEntity, UserEntity, OrganizationEntity, AuditLogEntity])],
    controllers: [TasksController],
    providers: [TaskService, Reflector],
})
export class TasksModule { }
