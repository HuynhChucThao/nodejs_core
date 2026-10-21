import { Inject, Injectable } from "@nestjs/common";
import { AUTH_OPTIONS } from "./auth.constants";
import { AuthModuleOptions, JwtPayload } from "./auth.interfaces";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class TokenService {
    constructor(
        private readonly jwt: JwtService,
        @Inject(AUTH_OPTIONS) private readonly options: AuthModuleOptions
    ) { }
    sign(payload: JwtPayload): string {
        return this.jwt.sign(payload, {
            secret: this.options.jwtSecret,
            expiresIn: (this.options.jwtExpiresIn ?? '7d') as any,
        });
    }

    verify(token: string): JwtPayload {
        return this.jwt.verify<JwtPayload>(token, {
            secret: this.options.jwtSecret,
        });
    }
}