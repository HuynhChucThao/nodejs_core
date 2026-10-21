import { Inject, Injectable } from "@nestjs/common";
import { AUTH_OPTIONS } from "./auth.constants";
import { AuthModuleOptions } from "./auth.interfaces";
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
    constructor(@Inject(AUTH_OPTIONS) private readonly options: AuthModuleOptions) { }

    public async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(this.options.bcryptRounds ?? 10);
        return bcrypt.hash(password, salt);
    }

    public async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }
}