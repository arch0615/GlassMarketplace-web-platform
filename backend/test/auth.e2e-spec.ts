import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST) — should register a new user', async () => {
    const email = `test-${Date.now()}@example.com`;
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email,
        password: 'testpass123',
        fullName: 'Test User',
        role: 'cliente',
      })
      .expect(201);

    expect(res.body).toHaveProperty('access_token');
    expect(res.body.user).toHaveProperty('email', email);
    expect(res.body.user).toHaveProperty('role', 'cliente');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('/auth/register (POST) — should reject duplicate email', async () => {
    const email = `dup-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'pass123', fullName: 'Dup User', role: 'cliente' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'pass456', fullName: 'Dup User 2', role: 'cliente' })
      .expect(409);
  });

  it('/auth/login (POST) — should login with valid credentials', async () => {
    const email = `login-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'mypassword', fullName: 'Login User', role: 'cliente' });

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'mypassword' })
      .expect(201);

    expect(res.body).toHaveProperty('access_token');
    expect(res.body.user).toHaveProperty('email', email);
  });

  it('/auth/login (POST) — should reject wrong password', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@lensia.com', password: 'wrongpassword' })
      .expect(401);
  });

  it('/auth/me (GET) — should return current user with token', async () => {
    const email = `me-${Date.now()}@example.com`;
    const reg = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, password: 'pass123', fullName: 'Me User', role: 'cliente' });

    const token = reg.body.access_token;
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body).toHaveProperty('email', email);
    expect(res.body).not.toHaveProperty('password');
  });

  it('/auth/me (GET) — should reject without token', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .expect(401);
  });

  it('/auth/forgot-password (POST) — should accept valid email', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/forgot-password')
      .send({ email: 'admin@lensia.com' })
      .expect(201);

    expect(res.body).toHaveProperty('message');
  });

  it('/auth/reset-password (POST) — should reject invalid token', async () => {
    await request(app.getHttpServer())
      .post('/auth/reset-password')
      .send({ token: 'invalid-token', password: 'newpass123' })
      .expect(400);
  });
});
