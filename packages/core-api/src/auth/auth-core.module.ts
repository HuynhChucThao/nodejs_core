import { JwtModule } from "@nestjs/jwt";
import { AuthModuleOptions, UserStore } from "./auth.interfaces";
import { AUTH_OPTIONS, USER_STORE } from "./auth.constants";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";
import { DynamicModule, Module, Type } from "@nestjs/common";
import { CoreAuthService } from "./auth.service";
import { CoreJwtStrategy } from "./jwt.strategy";
import { PassportModule } from "@nestjs/passport";

function assertOptions(o: AuthModuleOptions) {
    if (!o?.jwtSecret || o.jwtSecret.length < 16) {
        throw new Error('AuthCoreModule: jwtSecret is required and at least 16 characters.')
    }
    return o
}

const COMMON_PROVIDERS = [
    PasswordService,
    TokenService,
    CoreAuthService,
    CoreJwtStrategy
];
const COMMON_EXPORTS = [
    PasswordService,
    TokenService,
    CoreAuthService,
    AUTH_OPTIONS
];

export interface AuthCoreAsyncOptions {
    // Module cung cấp thứ mà store và useFactory cần (CònigModule, PrismaModule...)
    imports?: any[];
    inject?: any[];
    useFactory: (...args: any[]) => AuthModuleOptions | Promise<AuthModuleOptions>
    // Class của app implements UserStore
    userStore: Type<UserStore>;
}

@Module({})
export class AuthCoreModule { // Tên AuthCoreModule để ko đụng AuthModule hiện có trong app. Giao đoạn chuyển tiếp 2 module cùng tồn tại
    // static forRoot(opts: AuthCoreAsyncOptions): DynamicModule {
    //     // assertOptions(options);
    //     return {
    //         module: AuthCoreModule,
    //         // global: true,
    //         imports: [
    //             JwtModule.register({}), // để trống {}, vì mỗi lần sign/verify ta truyền secret từ options.Như vậy ko có chỗ nào đọc process.env
    //             PassportModule.register({ defaultStrategy: 'jwt' }),
    //             ...(opts.imports ?? [])
    //         ],
    //         providers: [
    //             {
    //                 provide: AUTH_OPTIONS,
    //                 useFactory: async (...args: any[]) => assertOptions(await opts.useFactory(...args)),
    //                 inject: opts.inject ?? [],
    //             },
    //             {
    //                 provide: USER_STORE, useClass: opts.userStore
    //             },
    //             ...COMMON_PROVIDERS
    //         ],
    //         exports: [...COMMON_EXPORTS, USER_STORE]
    //     };
    // }
    static forRootAsync(opts: AuthCoreAsyncOptions): DynamicModule {
        return {
            module: AuthCoreModule,
            imports: [
                JwtModule.register({}), // để trống {}, vì mỗi lần sign/verify ta truyền secret từ options.Như vậy ko có chỗ nào đọc process.env
                PassportModule.register({ defaultStrategy: 'jwt' }),
                ...(opts.imports ?? [])
            ],
            providers: [
                {
                    provide: AUTH_OPTIONS,
                    useFactory: async (...args: any[]) => assertOptions(await opts.useFactory(...args)),
                    inject: opts.inject ?? [] // assertOptions là lớp bảo vệ thứ hai (sau validate .env): core tự từ chối chạy với secret thiếu hoặc quá ngắn
                },
                {
                    provide: USER_STORE, useClass: opts.userStore
                },
                ...COMMON_PROVIDERS
            ],
            exports: [...COMMON_EXPORTS, USER_STORE]
        }
    }
}