import { JwtService } from "@nestjs/jwt";
import { FakeUserStore } from "./__tests__/fake-user-store";
import { AuthModuleOptions, DEFAULT_AUTH_MESSAGES } from "./auth.interfaces";
import { PasswordService } from "./password.service";
import { TokenService } from "./token.service";
import { CoreAuthService } from "./auth.service";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";

function setup(override: Partial<AuthModuleOptions> = {}) {
    const options: AuthModuleOptions = {
        jwtSecret: 'a'.repeat(32),
        bcryptRounds: 4,
        ...override,
    };
    const store = new FakeUserStore();
    const passwords = new PasswordService(options);
    const tokens = new TokenService(new JwtService({}), options);
    const auth = new CoreAuthService(store, options, passwords, tokens);
    return { store, passwords, tokens, auth }
}

const PW = 'MatKhau123';

describe('CoreAuthService', () => {
    describe('register', () => {
        it('create user, return valid token and NOT disclose your password', async () => {
            const { auth, tokens } = setup();
            const res = await auth.register({ email: 'A@Test.com', password: PW, name: 'An' });

            expect(res.message).toBe(DEFAULT_AUTH_MESSAGES.registerSuccess);
            expect(res.user.email).toBe('a@test.com');
            expect(res.user.name).toBe('An');
            expect(res.user).not.toHaveProperty('password')
            expect(res.user).not.toHaveProperty('passwordHash');
            expect(tokens.verify(res.accessToken).sub).toBe(res.user.id);
        });

        it('Store passwords as hashes and do not store the original versions.', async () => {
            const { auth, store, passwords } = setup();
            await auth.register({ email: 'a@test.com', password: PW, name: 'An' });

            const row = store.raw('a@test.com')!;
            expect(row.passwordHash).not.toBe(PW);
            expect(await passwords.comparePassword(PW, row.passwordHash)).toBe(true);
        })

        it('pass the additional data to the store, but without the password', async () => {
            const { auth, store } = setup();
            const spy = jest.spyOn(store, 'create');

            await auth.register({ email: 'a@test.com', password: PW, name: 'An', dreamWork: 'Ky su' })

            const arg = spy.mock.calls[0][0];
            expect(arg.extra).toEqual({ name: 'An', dreamWork: 'Ky su' });
            expect(arg.extra).not.toHaveProperty('password');
        });

        it('email exists (Both LowerCase/UpperCase) → throw error', async () => {
            const { auth } = setup();
            await auth.register({ email: 'a@test.com', password: PW, name: 'An' })

            const attempt = auth.register({ email: 'A@TEST.com', password: PW });
            await expect(attempt).rejects.toBeInstanceOf(BadRequestException);
            await expect(attempt).rejects.toThrow(DEFAULT_AUTH_MESSAGES.emailTaken);
        });
    });

    describe('login', () => {
        it('right information -> valid token, not disclose password', async () => {
            const { auth, tokens } = setup();
            const reg = await auth.register({ email: 'a@test.com', password: PW });

            const res = await auth.login({ email: 'a@test.com', password: PW });
            expect(res.message).toBe(DEFAULT_AUTH_MESSAGES.loginSuccess);
            expect(res.user).not.toHaveProperty('Password');
            expect(res.user).not.toHaveProperty('passwordHash')
            expect(tokens.verify(res.accessToken).sub).toBe(reg.user.id);
        });

        it('email be writen UpperCase or lowerCase still be accepted ', async () => {
            const { auth } = setup();
            await auth.register({ email: 'a@test.com', password: PW });
            await expect(auth.login({ email: 'A@TEST.COM', password: PW })).resolves.toBeDefined();
        });

        it('wrong password and wrong email are rejected (same message)', async () => {
            const { auth } = setup();
            await auth.register({ email: 'a@test.com', password: PW });

            const wrongPw = await auth.login({ email: 'a@test.com', password: 'WrongPassword' }).catch((e) => e);
            const noUser = await auth.login({ email: 'no-user@test.com', password: PW }).catch((e) => e);

            expect(wrongPw).toBeInstanceOf(UnauthorizedException);
            expect(noUser).toBeInstanceOf(UnauthorizedException);
            expect(wrongPw.message).toBe(noUser.message);
            expect(wrongPw.message).toBe(DEFAULT_AUTH_MESSAGES.invalidCredentials);
        });

        it('locked user (isActive=false) are rejected', async () => {
            const { auth, store, passwords } = setup();
            const reg = await auth.register({ email: 'a@test.com', password: PW });
            store.setActive(reg.user.id, false);

            const spy = jest.spyOn(passwords, 'comparePassword');
            const attempt = auth.login({ email: 'a@test.com', password: PW });

            await expect(attempt).rejects.toBeInstanceOf(UnauthorizedException);
            await expect(attempt).rejects.toThrow(DEFAULT_AUTH_MESSAGES.accountLocked);
            expect(spy).not.toHaveBeenCalled();
        });

        it('app with notification-overriding capabilities (multilingual)', async () => {
            const { auth } = setup();
            await expect(auth.login({ email: 'x@test.com', password: PW })).rejects.toThrow('Invalid credentials');
        });

    });
    describe('getMe', () => {
        it('user not exist -> Unauthorized', async () => {
            const { auth } = setup();
            await expect(auth.getMe('khong-co')).rejects.toBeInstanceOf(UnauthorizedException);
        });
    });
});