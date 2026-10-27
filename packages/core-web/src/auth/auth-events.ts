export interface AuthEvents {
    // Gọi khi một request có token bị 401
    emitUnauthorized(): void;

    // Đăng ký lắng nghe; trả về hàm hủy đăng ký
    subscribe(listener: () => void): () => void;
}

export function createAuthEvents(): AuthEvents {
    const listeners = new Set<() => void>();

    return {
        emitUnauthorized() {
            // Sao chép trước khi duyệt: listener có thể hủy đăng ký ngay trong lúc chạy 
            [...listeners].forEach((listener) => listener());
        },

        subscribe(listener) {
            listeners.add(listener);
            return () => { listeners.delete(listener); };
        }
    };
}