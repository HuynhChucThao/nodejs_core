export interface TokenStorage {
    get(): string | null;
    set(token: string | null): void;
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/**
 * Lưu token theo key do app chọn. Mặc định dùng localStorage.
 * Bọc try/catch vì localStorage có thể ném lỗi (chế độ riêng tư, bị chặn, SSR).
 */
export function createTokenStorage(key: string, storage?: StorageLike): TokenStorage {
    const resolve = (): StorageLike | null =>
        storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);

    return {
        get() {
            try {
                return resolve()?.getItem(key) ?? null;
            } catch (_) {
                return null;
            }
        },
        set(token) {
            try {
                const s = resolve();
                if (!s) return;
                if (token) s.setItem(key, token);
                else s.removeItem(key);
            } catch {
                // bỏ qua: không lưu được thì coi như chưa đăng nhập
            }
        },
    };
}