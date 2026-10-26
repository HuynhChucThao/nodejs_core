// Dạng response thành công do ResponseInterceptor của core-api tạo ra
export interface ApiEnvelope<T> {
    success: true;
    statusCode: number;
    data: T;
    timestamp: string;
}

export function isEnvelope<T>(body: unknown): body is ApiEnvelope<T> {
    if (typeof body != 'object' || body === null || Array.isArray(body)) return false;
    const b = body as Record<string, unknown>;
    return (
        b.success === true
        && typeof b.statusCode === 'number'
        && typeof b.timestamp === 'string'
    )
}

// Bóc envelope nếu đúng dạng chuẩn, ngược lại trả nguyên (tương thích ngược)
export function unwrapEnvelope<T>(body: unknown): T {
    return (isEnvelope<T>(body) ? body.data : body) as T;
}