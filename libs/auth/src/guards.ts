import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@rbac-task-system/data';
import { ROLES_KEY } from './decorators';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        if (!user) return false;

        // Role hierarchy logic
        const roleWeights = {
            [UserRole.OWNER]: 3,
            [UserRole.ADMIN]: 2,
            [UserRole.VIEWER]: 1,
        };

        const userWeight = roleWeights[user.role as UserRole] || 0;

        // Return true if user's role weight is >= any of the required roles' weights
        return requiredRoles.some(role => userWeight >= roleWeights[role]);
    }
}

@Injectable()
export class OwnershipGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const resource = request.body || request.params;

        // Owners can access everything
        if (user.role === UserRole.OWNER) {
            return true;
        }

        // Admins can access within their organization (and hierarchy handled via org service usually, but here scoped to their org)
        if (user.role === UserRole.ADMIN) {
            return resource.organizationId === user.organizationId;
        }

        // Viewers can only access their own resources
        if (user.role === UserRole.VIEWER) {
            return resource.ownerId === user.id || resource.id === user.id;
        }

        return false;
    }
}
