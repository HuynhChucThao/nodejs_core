import { ExecutionContext, ForbiddenException, SetMetadata } from "@nestjs/common";
import { Roles } from "../decorators/roles.decorator";
import { RolesGuard } from "./roles.guard";
import { Reflector } from "@nestjs/core";
import { Public } from "../decorators/public.decorator";
import { JwtAuthGuard } from "./jwt-auth.guard";

function ctx(handle: Function, cls: Function, user?: unknown): ExecutionContext {
    return {
        getHandler: () => handle,
        getClass: () => cls,
        switchToHttp: () => ({ getRequest: () => ({ user: user }) }),
    } as unknown as ExecutionContext;
}

@Roles("ADMIN")
class AdminController {
    list() {}
    @Roles('STUDENT', 'ADMIN')
    shared() {}
}
class OpenController {
    list() {}
}
class WrongKeyController {
    @SetMetadata('roles', ['ADMIN']) // Key khác key của core
    list() {}
}
describe('RolesGuard', () => {
    const guard = new RolesGuard(new Reflector());
    const admin = { id: '1', role: 'ADMIN'};
    const student = {id: '2', role: 'STUDENT'};

    it('route not require role -> true', () => {
        const c = ctx(OpenController.prototype.list, OpenController, student);
        expect(guard.canActivate(c)).toBe(true);
    });
    it('Student acess ADMIN route', () => {
        const c = ctx(AdminController.prototype.list, AdminController, student);
        expect(() => guard.canActivate(c)).toThrow(ForbiddenException);
    });
    it('Admin acess ADMIN route -> true', () => {
        expect(guard.canActivate(ctx(AdminController.prototype.list, AdminController, admin))).toBe(true);
    });
    it('no user -> Forbidden', () => {
        const c = ctx(AdminController.prototype.list, AdminController, undefined);
        expect(() => guard.canActivate(c)).toThrow(ForbiddenException);
    });
    it('label in method overrides lable in class', () => {
        const c = ctx(AdminController.prototype.shared, AdminController, student);
        expect(guard.canActivate(c)).toBe(true);
    });
    it('NOTE: Labels that deviate from the key are ignored by the guard → all are allowed through (risk documented)', () => {
        const c = ctx(WrongKeyController.prototype.list, WrongKeyController, student);
        expect(guard.canActivate(c)).toBe(true);
    })
})

describe('JwtAuthGuard', () => {
    class PublicController {
        @Public()
        open() {}
    }

    it('route @Public enable pass without token', () => {
        const guard = new JwtAuthGuard(new Reflector());
        const c = ctx(PublicController.prototype.open, PublicController, undefined);
        expect(guard.canActivate(c)).toBe(true);
    });
})