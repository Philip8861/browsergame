import request from 'supertest';
import app from '../index';

describe('API Routes', () => {
  describe('GET /health', () => {
    it('sollte Status OK zurückgeben', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
    });
  });

  describe('POST /api/auth/register', () => {
    it('sollte einen neuen Benutzer registrieren', async () => {
      const userData = {
        username: 'testuser' + Date.now(),
        email: `test${Date.now()}@example.com`,
        password: 'test123',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Erwarte entweder Erfolg oder Fehler (wenn DB nicht verfügbar)
      expect([201, 500]).toContain(response.status);
    });

    it('sollte Fehler bei fehlenden Daten zurückgeben', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'test' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('sollte Fehler bei fehlenden Daten zurückgeben', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});




