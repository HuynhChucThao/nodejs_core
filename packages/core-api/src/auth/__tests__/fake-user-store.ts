// UserStore chạy trong bộ nhớ, dùng test.Tuân thủ đúng hợp đồng của interface

import { AuthUser, AuthUserWithPassword, CreateUserInput, UserStore } from "../auth.interfaces";

export class FakeUserStore implements UserStore {
    private rows = new Map<string, AuthUserWithPassword>()
    private seq = 0;
    async findByEmailWithPassword(email: string) {
        const row = [...this.rows.values()].find((r) => r.email === email);
        return row ? { ...row } : null;
    }

    async findById(id: string) {
        const row = this.rows.get(id);
        if (!row) return null;
        const { passwordHash: _omit, ...user } = row; // hợp đồng: findById KHÔNG có mật khẩu
        return user as AuthUser;
    }
    async existsByEmail(email: string) {
        return [...this.rows.values()].some((r) => r.email === email)
    }
    async create(input: CreateUserInput) {
        const id = 'u' + String(++this.seq);
        const row: AuthUserWithPassword = {
            ...input.extra,
            id,
            email: input.email,
            passwordHash: input.passwordHash,
            isActive: true,
            role: 'STUDENT',
        }
        this.rows.set(id, row);
        const { passwordHash: _omit, ...user } = row;
        return user as AuthUser;
    }

    // Hàm tiện ích cho test để inject dữ liệu vào store (Không thuộc interface)
    setActive(id: string, isActive: boolean) {
        this.rows.get(id)!.isActive = isActive;
    }
    setRole(id: string, role: string) {
        this.rows.get(id)!.role = role;
    }
    remove(id: string) {
        this.rows.delete(id);
    }
    raw(email: string) {
        return [...this.rows.values()].find((r) => r.email === email)
    }
}