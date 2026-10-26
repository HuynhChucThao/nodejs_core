import { createTokenStorage } from "./token-storage";

function fakeStorage() {
    const m = new Map<string, string>();
    return {
        getItem: (key: string) => m.get(key) ?? null,
        setItem: (key: string, value: string) => void m.set(key, value),
        removeItem: (key: string) => void m.delete(key),
        raw: m,
    };
}

describe('createTokenStorage', () => {
    it('Lưu và đọc theo đúng key do app chọn', () => {
        const s = fakeStorage();
        const t = createTokenStorage('riasec_tokens', s);
        t.set('abc');
        expect(t.get()).toBe('abc');
        expect(s.raw.get('riasec_tokens')).toBe('abc');
    });
    it('set(null) xóa token', () => {
        const s = fakeStorage();
        const t = createTokenStorage('riasec_tokens', s);
        t.set('abc');
        expect(t.get()).toBe('abc');
        t.set(null);
        expect(t.get()).toBeNull();
    })
    it('Hai app khác key không đè lên nhau', () => {
        const broken = {
            getItem: () => { throw new Error('blocked'); },
            setItem: () => { throw new Error('blocked'); },
            removeItem: () => { throw new Error('blocked'); },
        };
        const t = createTokenStorage('k', broken);
        expect(() => t.set('x')).not.toThrow();
        expect(t.get()).toBeNull();
    });
    it('Không có localStorage (môi trường Node) -> get trả null', () => {
        expect(createTokenStorage('k').get()).toBeNull();
    });
})