import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './guards';
import { UserRole } from '@rbac-task-system/data';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    beforeEach(() => {
        reflector = new Reflector();
        guard = new RolesGuard(reflector);
    });

    const createMockContext = (userRole: UserRole, requiredRoles?: UserRole[]): ExecutionContext => {
        const mockContext = {
            getHandler: jest.fn(),
            getClass: jest.fn(),
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: jest.fn().mockReturnValue({
                    user: { role: userRole }
                })
            })
        } as unknown as ExecutionContext;

        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);
        return mockContext;
    };

    it('should allow access if no roles are required', () => {
        const context = createMockContext(UserRole.VIEWER, undefined);
        expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow OWNER to access ADMIN routes', () => {
        const context = createMockContext(UserRole.OWNER, [UserRole.ADMIN]);
        expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow ADMIN to access VIEWER routes', () => {
        const context = createMockContext(UserRole.ADMIN, [UserRole.VIEWER]);
        expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny VIEWER from accessing ADMIN routes', () => {
        const context = createMockContext(UserRole.VIEWER, [UserRole.ADMIN]);
        expect(guard.canActivate(context)).toBe(false);
    });

    it('should allow exact role match', () => {
        const context = createMockContext(UserRole.ADMIN, [UserRole.ADMIN]);
        expect(guard.canActivate(context)).toBe(true);
    });
});
