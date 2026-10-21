import { BadRequestException, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthMessages, AuthModuleOptions, AuthUser, DEFAULT_AUTH_MESSAGES, UserStore } from "./auth.interfaces";
import { AUTH_OPTIONS, USER_STORE } from "./auth.constants";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";

export interface RegisterInput {
    email: string;
    password: string;
    [extra: string]: unknown;
}

export interface LoginInput {
    email: string;
    password: string;
}

@Injectable()
export class CoreAuthService {
    private readonly messages: AuthMessages;

    constructor(
        @Inject(USER_STORE) private readonly users: UserStore,
        @Inject(AUTH_OPTIONS) options: AuthModuleOptions,
        private readonly passwords: PasswordService,
        private readonly tokens: TokenService
    ) {
        this.messages = {
            ...DEFAULT_AUTH_MESSAGES, ...options.messages
        }

    }
    async register(input: RegisterInput) {
        const { email, password, ...extra } = input;
        const normalized = email.toLowerCase();
        if (await this.users.existsByEmail(normalized)) {
            throw new BadRequestException(this.messages.emailTaken);
        }

        const passwordHash = await this.passwords.hashPassword(password);
        const user = await this.users.create({
            email: normalized,
            passwordHash,
            extra,
        })
        return {
            message: this.messages.registerSuccess,
            user,
            accessToken: await this.signFor(user),
        };

    }

    async login(input: LoginInput) {
        const found = await this.users.findByEmailWithPassword(input.email.toLowerCase());
        if (!found) {
            throw new UnauthorizedException(this.messages.invalidCredentials);
        }
        if (!found.isActive) {
            throw new UnauthorizedException(this.messages.accountLocked);
        }

        const ok = await this.passwords.comparePassword(input.password, found.passwordHash);
        if (!ok) {
            throw new UnauthorizedException(this.messages.invalidCredentials);
        }

        // Loại passwordHash trước khi trả ra ngoài
        const { passwordHash: _omit, ...user } = found;
        return {
            message: this.messages.loginSuccess,
            user,
            accessToken: await this.signFor(user),
        }
    }

    async getMe(userId: string){
        const user = await this.users.findById(userId)
        if(!user){
            throw new UnauthorizedException(this.messages.userNotFound);
        }
        return user;
    }

    private async signFor(user: AuthUser): Promise<string> {
        return await this.tokens.sign({
            sub: user.id,
            email: user.email,
            role: user.role,
        })
    }
}