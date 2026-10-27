import { act, JSX, ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { TokenStorage } from "../api/token-storage";
import { createAuthEvents } from "./auth-events";
import { AuthContextValue, AuthProvider, useAuth } from "./auth-provider";
import { ApiError } from "../api/api-error";

interface User {
    id: string;
    name: string;
}

const an: User = { id: '1', name: 'An' };

function memoryTokens(initial: string | null = null) {
    let value = initial;
    const storage: TokenStorage & { value(): string | null } = {
        get: () => value,
        set: (t) => {
            value = t;
        },
        value: () => value,
    };
    return storage;
}

function deferred<T>() {
    let resolve!: (v: T) => void;
    let reject!: (err: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

function setup(opts: { token?: string | null; fetchProfile?: () => Promise<User> } = {}) {
    const tokens = memoryTokens(opts.token ?? null);
    const fetchProfile = opts.fetchProfile ?? jest.fn(async () => an);
    const events = createAuthEvents();
    const wrapper = ({ children }: { children: ReactNode }) => (
        <AuthProvider tokenStorage={tokens} fetchProfile={fetchProfile} events={events}>
            {children}
        </AuthProvider>
    );
    const hook = renderHook(() => useAuth<User>(), { wrapper });
    return { ...hook, tokens, fetchProfile, events };
}

describe('AuthProvider: Khi mở trang', () => {
    it('không có token -> unauthenticated ngay, không gọi API', () => {
        const { result, fetchProfile } = setup({ token: null });
        expect(result.current.status).toBe('unauthenticated');
        expect(fetchProfile).not.toHaveBeenCalled();
    });
    it('có token -> loading, rồi authenticated kèm user', async () => {
        const { result } = setup({ token: 'token' });
        expect(result.current.status).toBe('loading');
        await waitFor(() => expect(result.current.status).toBe('authenticated'));
        expect(result.current.user).toEqual(an);
        expect(result.current.isAuthenticated).toBe(true);
    });
    it('token bị 401 -> unauthenticated và XÓA token', async () => {
        const { result, tokens } = setup({
            token: 'ok',
            fetchProfile: async () => {
                throw new ApiError('het han', 401)
            },
        });
        await waitFor(() => expect(result.current.status).toBe('unauthenticated'));
        expect(tokens.value()).toBeNull();
    });
})

describe('AuthProvider: signIn và signOut', () => {
    it('signIn thành công -> lưu token, có user, trả kết quả', async () => {
        const { result, tokens } = setup({ token: null });
        await act(async () => {
            await result.current.signIn(async () => ({ user: an, accessToken: 'new-token' }));
        });
        expect(tokens.value()).toBe('new-token')
        expect(result.current.status).toBe('authenticated');
        expect(result.current.user).toEqual(an);
    });
    it('signIn thất bại -> ném lỗi cho form, trạng thâis và token không đổi', async () => {
        const { result, tokens } = setup({ token: null });
        await act(async () => {
            expect(result.current.status).toBe('unauthenticated');
            expect(tokens.value()).toBeNull();
        });
    });

    it('signOut -> xóa token và user', async () => {
        const { result, tokens } = setup({ token: 'token' });
        await waitFor(() => expect(result.current.status).toBe('authenticated'));
        act(() => {
            result.current.signOut()
        });
        expect(tokens.value()).toBeNull();
        expect(result.current.status).toBe('unauthenticated');
        expect(result.current.user).toBeNull();
    });
});

describe('AuthProvider: hết phiên và chạy đua', () => {
    it('nhận tín hiệu 401 từ API client -> tự đăng xuất', async () => {
        const { result, events, tokens } = setup({ token: 'token' });
        await waitFor(() => expect(result.current.status).toBe('authenticated'));
        act(() => events.emitUnauthorized());
        expect(result.current.status).toBe('unauthenticated');
        expect(tokens.value()).toBeNull();
    });
    it('đăng xuất trong lúc đang tải hồ sơ -> phản hồi về muộn KHÔNG đăng nhập lại', async () => {
        const d = deferred<User>();
        const { result } = setup({ token: 'token', fetchProfile: () => d.promise });
        expect(result.current.status).toBe('loading');

        act(() => result.current.signOut());
        await act(async () => {
            d.resolve(an); // phản hồi cũ về sau khi đã đăng xuất
        });
        expect(result.current.status).toBe('unauthenticated');
        expect(result.current.user).toBeNull();
    });
    it('refresh tải lại hồ sơ mới', async () => {
        let name = 'An';
        const { result } = setup({
            token: 'token',
            fetchProfile: async () => ({ id: '1', name })
        });
        await waitFor(() => expect(result.current.user?.name).toBe('An'));
        name = 'Binh';
        await act(async () => {
            await result.current.refresh();
        });
        expect(result.current.user?.name).toBe('Binh');
    });
    it('refresh gặp lỗi tạm thời -> GIỮ user và phiên', async () => {
        let fail = false;
        const { result, tokens } = setup({
            token: 'token',
            fetchProfile: async () => {
                if (fail) throw new ApiError('retry later', 500)
                return an;
            }
        })
        await waitFor(() => expect(result.current.status).toBe('authenticated'));

        fail = true;
        await act(async () => {
            await result.current.refresh();
        });
        expect(result.current.user).toEqual(an);
        expect(tokens.value()).toBe('token');
        expect(result.current.status).toBe('authenticated');
    });
    it('refresh gặp lỗi 401 -> đăng xuất và xóa token', async () => {
        let expired = false;
        const { result, tokens } = setup({
            token: 'token',
            fetchProfile: async () => {
                if (expired) throw new ApiError('expired', 401)
                return an;
            }
        })
        await waitFor(() => expect(result.current.status).toBe('authenticated'));
        expired = true;
        await act(async () => {
            await result.current.refresh();
        });
        expect(result.current.status).toBe('unauthenticated');
        expect(tokens.value()).toBeNull();
    });
    it('đang refresh thì nhận 401 -> không đăng nhập lại', async () => {
        const d = deferred<User>();
        const { result, tokens } = setup({
            token: 'token',
            fetchProfile: () => d.promise
        });
        expect(result.current.status).toBe('loading');
        await act(async () => {
            d.resolve(an);
        })
    })
});
describe('useAuth', () => {
    it('dùng ngoài AuthProvider → ném lỗi rõ ràng', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
        expect(() => renderHook(() => useAuth())).toThrow(/AuthProvider/);
        spy.mockRestore();
    });
});


