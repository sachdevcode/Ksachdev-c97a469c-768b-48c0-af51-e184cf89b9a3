import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TaskService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto } from '@rbac-task-system/data';
import { RolesGuard } from '@rbac-task-system/auth';

@Controller('tasks')
export class TasksController {
    constructor(private taskService: TaskService) { }

    @Post()
    create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
        return this.taskService.create(createTaskDto, req.user);
    }

    @Get()
    findAll(@Request() req) {
        return this.taskService.findAll(req.user);
    }

    @Get('audit-log')
    getAuditLogs(@Request() req) {
        return this.taskService.getAuditLogs(req.user);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.taskService.findOne(id, req.user);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() updateTaskDto: UpdateTaskDto,
        @Request() req,
    ) {
        return this.taskService.update(id, updateTaskDto, req.user);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.taskService.remove(id, req.user);
    }
}
