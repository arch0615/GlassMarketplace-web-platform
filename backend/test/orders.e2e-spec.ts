import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Orders Flow (e2e)', () => {
  let app: INestApplication;
  let clientToken: string;
  let opticaToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // Login as seed users
    const clientLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'cliente@lensia.com', password: 'password' });
    clientToken = clientLogin.body.access_token;

    const opticaLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'optica@lensia.com', password: 'password' });
    opticaToken = opticaLogin.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/orders/mine (GET) — should return orders for authenticated client', async () => {
    const res = await request(app.getHttpServer())
      .get('/orders/mine')
      .set('Authorization', `Bearer ${clientToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/orders/mine (GET) — should return orders for authenticated optica', async () => {
    const res = await request(app.getHttpServer())
      .get('/orders/mine')
      .set('Authorization', `Bearer ${opticaToken}`)
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/orders/mine (GET) — should reject without auth', async () => {
    await request(app.getHttpServer())
      .get('/orders/mine')
      .expect(401);
  });

  it('/payments/preference/:orderId (GET) — should reject with invalid order', async () => {
    await request(app.getHttpServer())
      .get('/payments/preference/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${clientToken}`)
      .expect(404);
  });
});
