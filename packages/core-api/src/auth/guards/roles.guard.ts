import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../auth.constants";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }
    canActivate(context: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!required) return true;
        const user = context.switchToHttp().getRequest().user;
        if (!user || !required.includes(user.role)) {
            throw new ForbiddenException('You are not allowed to access this resource!');
        }

        return true;
    }
}