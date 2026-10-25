import { PasswordService } from "./password.service"

describe('PasswordService', () => {

    // rounds thấp để test chạy nhanh; production dùng 10
    const svc = new PasswordService({ jwtSecret: 'a'.repeat(32), bcryptRounds: 4 })

    it('hash() returns a non-empty string', async () => {
        const pw = 'MatKhau123';
        const hash = await svc.hashPassword(pw)
        expect(hash).not.toBe(pw); //hash không được bằng mật khẩu
        expect(hash).toMatch(/^\$2[aby]\$04\$/)
    });

    it('hashing the same password twice yields different results (salt)', async () => {
        const [h1, h2] = await Promise.all([
            svc.hashPassword('MatKhau123'),
            svc.hashPassword('MatKhau123')
        ])
        expect(h1).not.toBe(h2);
    });

    it('compare: right password -> true, wrong -> false', async () => {
        const hash = await svc.hashPassword('MatKhau123');
        expect(await svc.comparePassword('MatKhau123', hash)).toBe(true);
        expect(await svc.comparePassword('WrongMatKhau123', hash)).toBe(false);
    });

})