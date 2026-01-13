import { Controller, Get } from '@nestjs/common';
import { Public } from '@rbac-task-system/auth';

@Controller()
export class AppController {
    @Public()
    @Get()
    getHello() {
        return {
            status: 'ok',
            message: 'RBAC Task System API is running',
            version: '1.0.0',
            endpoints: [
                '/api/auth/login',
                '/api/auth/register',
                '/api/tasks'
            ]
        };
    }
}
