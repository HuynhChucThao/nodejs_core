import { JwtService } from "@nestjs/jwt";
import { TokenService } from "./token.service";

const make = (secret: string, jwtExpiresIn?: string) => new TokenService(new JwtService({}), { jwtSecret: secret, jwtExpiresIn });

const payload = { sub: 'u1', email: 'a@test.com', role: 'STUDENT' };

describe('TokenService', () => {
    const svc = make('a'.repeat(32));
    afterEach(() => jest.useRealTimers());

    it('signed and verifiable, payload intact', () => {
        const decode = svc.verify(svc.sign(payload));
        expect(decode).toMatchObject(payload);

    })

    it('limit 7 days, enable customize through options', () => {
        const decode = (t: string) =>
            JSON.parse(Buffer.from(t.split('.')[1], 'base64').toString());

        const def = decode(svc.sign(payload));
        expect(def.exp - def.iat).toBe(7 * 24 * 3600);
        const custom = decode(make('a'.repeat(32), '1h').sign(payload));
        expect(custom.exp - custom.iat).toBe(3600);
    });

    it('A token signed with a different secret is rejected', () => {
        const foreign = make('b'.repeat(32)).sign(payload);
        expect(() => svc.verify(foreign)).toThrow();
    });

    it('Token expires after issuance and is rejected', () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-01-01T00:00:00Z'));
        const token = svc.sign(payload);
        jest.setSystemTime(new Date('2026-01-09T00:00:00Z')); // Sau 8 ngày
        expect(() => svc.verify(token)).toThrow();
    });

    it('attack: alg=none, remove signature → rejected', () => {
        const enc = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
       const unsigned = `${enc({ alg: 'none', typ: 'JWT' })}.${enc({ ...payload, role: 'ADMIN' })}.`;
       expect(() => svc.verify(unsigned)).toThrow();
    })
})