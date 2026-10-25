import { Body, Controller, Get, INestApplication, Post, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { FakeUserStore } from './__tests__/fake-user-store';
import { AuthCoreModule } from './auth-core.module';
import { USER_STORE } from './auth.constants';
import { CoreAuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';


const SECRET = 'a'.repeat(32);
const PW = 'MatKhau123';

@Controller('t')
class TestController {
    constructor(private readonly auth: CoreAuthService) { }

    @Post('register')
    register(@Body() body: any) {
        return this.auth.register(body);
    }

    @Post('login')
    login(@Body() body: any) {
        return this.auth.login(body);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    me(@CurrentUser() user: unknown) {
        return user;
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    @Get('admin')
    admin() {
        return { ok: true };
    }
}
describe('Auth (Integrate: Nest + password + real guard, fake store', () => {
    let app: INestApplication;
    let server: any;
    let store: FakeUserStore;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                AuthCoreModule.forRootAsync({
                    useFactory: () => ({ jwtSecret: SECRET, bcryptRounds: 4 }),
                    userStore: FakeUserStore,
                }),
            ],
            controllers: [TestController],
        }).compile();
        app = moduleRef.createNestApplication({ logger: false });
        await app.init();
        server = app.getHttpServer();
        store = app.get<FakeUserStore>(USER_STORE, { strict: false });
    });
    afterAll(async () => {
        await app.close();
    });

    const bearer = (t: string) => ({ Authorization: `Bearer ${t}` });

    async function signUp(email = 'a@test.com') {
        await request(server)
            .post('/t/register')
            .send({ email, password: PW, name: 'A' });
        const res = await request(server)
            .post('/t/login')
            .send({ email, password: PW });
        return {
            token: res.body.accessToken,
            id: res.body.user.id,
            email,
        };
    }

    it('after logging in, call /me using the token → 200, password is not exposed', async () => {
        const { token, email } = await signUp();

        const res = await request(server).get('/t/me').set(bearer(token)).expect(200);

        expect(res.body).not.toHaveProperty('passwordHash');
        expect(res.body.email).toBe(email);
    });

    it('no token -> 401', async () => {
        await request(server).get('/t/me').expect(401);
    });
    it('invalid token or missing "Bearer" prefix -> 401', async () => {
        const { token } = await signUp();
        await request(server).get('/t/me').set(bearer('abc.def.ghi')).expect(401);
        await request(server).get('/t/me').set('Authorization', token).expect(401);
    });
    it('token signed or missed "Bearer" prefix', async () => {
        const { id, email } = await signUp();
        const forged = new JwtService({}).sign(
            { sub: id, email, role: 'ADMIN' },
            { secret: 'b'.repeat(32) },
        );
        await request(server).get('/t/me').set(bearer(forged)).expect(401);
    });

    it('token expire -> 401', async () => {
        const { id, email } = await signUp();
        const expired = new JwtService({}).sign(
            { sub: id, email, role: 'ADMIN', exp: Math.floor(Date.now() / 1000) - 60 },
            { secret: SECRET },
        );
        await request(server).get('/t/me').set(bearer(expired)).expect(401);
    });
    it('valid token but user is deleted -> 401', async () => {
        const { token, id } = await signUp();
        store.remove(id);
        await request(server).get('/t/me').set(bearer(token)).expect(401);
    });

    it('Account locking takes effect IMMEDIATELY for existing tokens; unlocking allows them to be used again.', async () => {
        const { token, id, email } = await signUp();
        await request(server).get('/t/me').set(bearer(token)).expect(200);

        store.setActive(id, false);
        await request(server).get('/t/me').set(bearer(token)).expect(401);
        await request(server).post('/t/login').send({ email, password: PW }).expect(401);

        store.setActive(id, true);
        await request(server).get('/t/me').set(bearer(token)).expect(200);
    });
    it('Authorize: STUDENT → 403, no token → 401', async () => {
        const { token } = await signUp();
        await request(server).get('/t/admin').set(bearer(token)).expect(403);
        await request(server).get('/t/admin').expect(401);
    });

    it('Change the role in the DB takes effect immediately with the old token (role is read from DB, not from token)', async () => {
        const { token, id } = await signUp();
        await request(server).get('/t/admin').set(bearer(token)).expect(403);

        store.setRole(id, 'ADMIN');
        await request(server).get('/t/admin').set(bearer(token)).expect(200);

        store.setRole(id, 'STUDENT');
        await request(server).get('/t/admin').set(bearer(token)).expect(403);
    });
})