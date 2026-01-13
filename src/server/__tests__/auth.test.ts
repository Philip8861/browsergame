import { UserModel } from '../models/User';
import { query } from '../utils/database';

// Mock der Datenbank
jest.mock('../utils/database', () => ({
  query: jest.fn(),
}));

describe('UserModel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('sollte einen neuen Benutzer erstellen', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        created_at: new Date(),
      };

      (query as jest.Mock).mockResolvedValue({
        rows: [mockUser],
      });

      const user = await UserModel.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(user).toEqual(mockUser);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining(['testuser', 'test@example.com'])
      );
    });
  });

  describe('findByEmail', () => {
    it('sollte einen Benutzer nach E-Mail finden', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
      };

      (query as jest.Mock).mockResolvedValue({
        rows: [mockUser],
      });

      const user = await UserModel.findByEmail('test@example.com');

      expect(user).toEqual(mockUser);
      expect(query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE email = $1',
        ['test@example.com']
      );
    });

    it('sollte null zurückgeben wenn Benutzer nicht gefunden', async () => {
      (query as jest.Mock).mockResolvedValue({
        rows: [],
      });

      const user = await UserModel.findByEmail('notfound@example.com');

      expect(user).toBeNull();
    });
  });
});




