import { ApiError } from "./api-error";
import { unwrapEnvelope } from "./envelope";

export interface ApiClientOptions {
    // Ví dụ '/api' hoặc 'https://api.example.com/api'
    baseUrl: string;
    // Hàm lấy token hiện tại; trả null nếu chưa đăng nhập
    getToken?: () => string | null;
    // Hàm gọi khi một request CÓ GỬI TOKEN bị 401 (phiên hết hạn hoặc tài khoản bị khóa)
    onUnauthorized?: (error: ApiError) => void;
    // Thay fetch (dùng cho test hoặc môi trường đặc biệt)
    fetchImpl?: typeof fetch;
}

export interface ApiClient {
    request<T>(endpoint: string, init?: RequestInit): Promise<T>;
}

function extractMessage(body: unknown, status: number): string {
    const b = body as { message?: unknown; error?: unknown } | null;
    const raw = b?.message ?? b?.error;
    if (Array.isArray(raw)) return raw.join(', ');
    if (typeof raw === 'string' && raw) return raw;
    return `Request failed with status ${status}`;
}

export function createApiClient(options: ApiClientOptions): ApiClient {
    const baseUrl = options.baseUrl.replace(/\/+$/, '');
    // Bọc lại để không gọi fetch "rời" khỏi window (gây lỗi Illegal invocation)
    const doFetch: typeof fetch = options.fetchImpl ?? ((input, init) => fetch(input, init));

    async function request<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
        const token = options.getToken?.() ?? null;

        const headers: Record<string, string> = {};
        const isForm = typeof FormData != 'undefined' && init.body instanceof FormData;

        if (!isForm) headers['Content-type'] = 'application/json';
        Object.assign(headers, init.headers as Record<string, string> | undefined);
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await doFetch(`${baseUrl}${endpoint}`, { ...init, headers });
        const body = await response.json().catch(() => null);

        if (!response.ok) {
            const correlationId =
                typeof (body as any)?.correlationId === 'string'
                    ? (body as any).correlationId
                    : undefined;
            const error = new ApiError(
                extractMessage(body, response.status),
                response.status,
                correlationId,
            );
            // Chỉ báo "hết phiên" khi request có kèm token. Đăng nhập sai mật khẩu cũng
            // là 401 nhưng chưa có token, không được coi là hết phiên.
            if (response.status === 401 && token) options.onUnauthorized?.(error);
            throw error;
        }

        return unwrapEnvelope<T>(body);
    }
    return { request };
}