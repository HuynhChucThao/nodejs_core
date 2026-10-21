export interface AuthModuleOptions {
    // Bắt buộc, không có giá trị mặc định
    jwtSecret: string;
    // Mặc định 7 ngày
    jwtExpiresIn?: string;
    bcryptRounds?: number; // Mặc định 10
    // Ghi đè một phần hoặc toàn bộ thông báo mặc định
    messages?: Partial<AuthMessages>;

}

export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}

export interface AuthUser {
    id: string;
    email: string;
    role: string;

    // App tự quy đổi từ status/enum của nó
    isActive: boolean;
    // Các field riêng của app (name, dreamWork...) đi qua nguyên dạng
    [extras: string]: unknown;
}

// AuthUser kèm hash mật khẩu, chỉ dùng nội bộ khi đăng nhập
export interface AuthUserWithPassword extends AuthUser {
    passwordHash: string;
}
export interface CreateUserInput {
    email: string;
    passWordHash: string;

    // Phần còn lại của DTO đăng ký (name, dreamWork...)
    extra: Record<string, unknown>;
}

/**
 * Hợp đồng giữa core và database.
 * App viết class implements interface này (Prisma, TypeORM, Mongo...).
 * Quy ước: mọi hàm trả về AuthUser phải KHÔNG chứa mật khẩu.
 */
export interface UserStore {
    // Dùng cho đăng nhập: cần cả passwordHash
    findByEmailWithPassword(email: string): Promise<AuthUserWithPassword | null>;
    // Dùng cho validate JWT và /auth/me: không có mật khẩu
    findById(id: string): Promise<AuthUser | null>;
    // Kiểm tra email đã tồn tại chưa
    existsByEmail(email: string): Promise<boolean>;
    // Tạo user, trả về AuthUser (không có mật khẩu)
    create(user: CreateUserInput): Promise<AuthUser>;
}

// Thông báo của core, app ghi đè được (đa ngôn ngữ)
export interface AuthMessages {
    emailTaken: string;
    invalidCredentials: string;
    accountLocked: string;
    userNotFound: string;
    registerSuccess: string;
    loginSuccess: string;
}

export const DEFAULT_AUTH_MESSAGES: AuthMessages = {
    emailTaken: 'Email has already been taken',
    invalidCredentials: 'Invalid credentials',
    accountLocked: 'Account has been locked',
    userNotFound: 'User not found',
    registerSuccess: 'User registered successfully',
    loginSuccess: 'User logged in successfully',
}