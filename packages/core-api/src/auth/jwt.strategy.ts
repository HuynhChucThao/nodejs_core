import { Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { AUTH_OPTIONS, USER_STORE } from "./auth.constants";
import { AuthModuleOptions, JwtPayload, UserStore } from "./auth.interfaces";
import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class CoreJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        @Inject(USER_STORE) private readonly users: UserStore,
        @Inject(AUTH_OPTIONS) private readonly options: AuthModuleOptions
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: options.jwtSecret,
        });
    }

    async validate(payload: JwtPayload) {
        const user = await this.users.findById(payload.sub);
        if (!user || !user.isActive){
            throw new UnauthorizedException(
                this.options.messages?.accountLocked ?? 'Account is not exist or not active'
            );
        }
        return user;
    }
}