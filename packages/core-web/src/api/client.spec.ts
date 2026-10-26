import { ApiError } from "./api-error";
import { ApiClientOptions, createApiClient } from "./client";

function reply(status: number, body?: unknown) {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: async () => {
            if (body === undefined) throw new Error('no body');
            return body;
        },
    } as unknown as Response;
}

const envelope = (data: unknown) => ({
    success: true,
    statusCode: 200,
    data,
    timestamp: '2026-10-26T00:00:00.000Z',
});
function setup(response: Response, over: Partial<ApiClientOptions> = {}) {
    const fetchImpl = jest.fn().mockResolvedValue(response);
    const client = createApiClient({ baseUrl: '/api', fetchImpl, ...over });
    return { client, fetchImpl };
}
const lastCall = (f: jest.Mock) => ({
    url: f.mock.calls[0][0] as string,
    init: f.mock.calls[0][1] as RequestInit & { headers: Record<string, string> },
})

describe('createApiClient: gửi request', () => {
    it('ghép baseUrl + endpoint, bỏ dấu / thừa ở cuối baseUrl', async () => {
        const { client, fetchImpl } = setup(reply(200, { x: 1 }), { baseUrl: '/api///' });
        await client.request('/occupation?page=1');
        expect(lastCall(fetchImpl).url).toBe('/api/occupation?page=1');
    });
    it('Có token -> gắn Bearer; không có token -> không gắn', async () => {
        const withToken = setup(reply(200, envelope(1)), { getToken: () => 'token' });
        await withToken.client.request('/me');
        expect(lastCall(withToken.fetchImpl).init.headers.Authorization).toBe('Bearer token');

        const withoutToken = setup(reply(200, envelope(1)), { getToken: () => null });
        await withoutToken.client.request('/me');
        expect(lastCall(withoutToken.fetchImpl).init.headers).not.toHaveProperty('Authorization');
    });
    it('Luôn gửi Content-Type JSON; header tùy chỉnh ghi đè được', async () => {
        const a = setup(reply(200, envelope(1)));
        await a.client.request('/x');
        expect(lastCall(a.fetchImpl).init.headers['Content-Type']).toBe('application/json');

        const b = setup(reply(200, envelope(1)));
        await b.client.request('/x', { headers: { 'Content-Type': 'text/plain' } });
        expect(lastCall(b.fetchImpl).init.headers['Content-Type']).toBe('text/plain');
    });
    it('Truyền nguyên method và body', async () => {
        const { client, fetchImpl } = setup(reply(201, envelope(1)));
        await client.request('/auth/login', { method: 'POST', body: '{ "a":1 }' });
        expect(lastCall(fetchImpl).init).toMatchObject({
            method: 'POST',
            body: '{ "a":1 }',
        });
    });
});

describe('createApiClient: nhận response', () => {
    it('bóc envelop thành công', async () => {
        const { client } = setup(reply(200, envelope({ accessToken: 't' })));
        await expect(client.request('/auth/login')).resolves.toEqual({ accessToken: 't' })
    });
    it('response không phải envelop được trả nguyên (tương thích ngược)', async () => {
        const { client } = setup(reply(200, envelope({ accessToken: 't' })));
        await expect(client.request('/auth/login')).resolves.toEqual({ accessToken: 't' });
    });
    it('body rỗng (204) -> null', async () => {
        const { client } = setup(reply(204));
        await expect(client.request('/x', { method: 'DELETE' })).resolves.toBeNull();
    });
});

describe('createApiClient: xử lý error', () => {
    const errBody = (message: unknown, extra: object = {}) => ({
        success: false, statusCode: 400, message, path: '/x', ...extra,
    });
    it('ném ApiError mang status và message từ backend', async () => {
        const { client } = setup(reply(400, errBody('Email này đã được đăng ký')));
        const err = (await client.request('/auth/register').catch((e) => e)) as ApiError;
        expect(err).toBeInstanceOf(ApiError);
        expect(err.status).toBe(400);
        expect(err.message).toBe('Email này đã được đăng ký');
    });
    it('message dạng mảng (ValidationPipe) được nối bằng ", "', async () => {
        const { client } = setup(reply(400, errBody(["email invalid", "password short"])));
        await expect(client.request('/x')).rejects.toThrow('email invalid, password short');
    });
    it('không có message thì dùng trường error, rồi tới thông báo mặc định', async () => {
        const a = setup(reply(404, { error: 'Not Found' }));
        await expect(a.client.request('/x')).rejects.toThrow('Not Found');

        const b = setup(reply(500, { foo: 1 }));
        await expect(b.client.request('/x')).rejects.toThrow('Request failed with status 500');

        const c = setup(reply(502)); // body không phải JSON
        await expect(c.client.request('/x')).rejects.toThrow('Request failed with status 502');
    });
    it('giữ correlationId để người dùng báo lỗi', async () => {
        const { client } = setup(reply(500, errBody('Internal server error', { correlationId: 'abc-123' })));
        const err = (await client.request('/x').catch((e) => e)) as ApiError;
        expect(err.correlationId).toBe('abc-123');
    });
});

describe('createApiClient: onUnauthorized', () => {
    it('401 khi ĐÃ gửi token (hết phiên, bị khóa) → gọi onUnauthorized', async () => {
        const onUnauthorized = jest.fn();
        const { client } = setup(reply(401, { message: 'het han' }), {
            getToken: () => 'tok',
            onUnauthorized,
        });
        await client.request('/auth/me').catch(() => undefined);
        expect(onUnauthorized).toHaveBeenCalledTimes(1);
        expect(onUnauthorized.mock.calls[0][0]).toBeInstanceOf(ApiError);
    });

    it('401 khi CHƯA có token (đăng nhập sai mật khẩu) → KHÔNG gọi', async () => {
        const onUnauthorized = jest.fn();
        const { client } = setup(reply(401, { message: 'sai mat khau' }), {
            getToken: () => null,
            onUnauthorized,
        });
        await client.request('/auth/login').catch(() => undefined);
        expect(onUnauthorized).not.toHaveBeenCalled();
    });

    it('403 và 500 không gọi onUnauthorized', async () => {
        const onUnauthorized = jest.fn();
        for (const status of [403, 500]) {
            const { client } = setup(reply(status, { message: 'x' }), {
                getToken: () => 'tok',
                onUnauthorized,
            });
            await client.request('/x').catch(() => undefined);
        }
        expect(onUnauthorized).not.toHaveBeenCalled();
    });
});