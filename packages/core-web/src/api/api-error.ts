export class ApiError extends Error {
    readonly status: number;

    // Mã try vết do backend trả về, để người dùng báo lỗi và bạn tìm đúng log
    readonly correlationId?: string;

    constructor(message: string, status: number, correlationId?: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.correlationId = correlationId;
        Object.setPrototypeOf(this, ApiError.prototype); // giữ instanceOf đúng
    }
}