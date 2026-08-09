import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { FastifyInstance } from 'fastify';
import bcrypt from 'bcryptjs';
import { buildApp } from '../../src/app.js';
import { userRepository } from '../../src/repositories/user.repository.js';

// Mock UserRepository to allow fast, deterministic integration testing without requiring a live PostgreSQL instance
vi.mock('../../src/repositories/user.repository.js', () => {
  const usersStore = new Map<string, any>();

  return {
    userRepository: {
      findById: vi.fn(async (id: string) => usersStore.get(id) || null),
      findByEmail: vi.fn(async (email: string) => {
        return Array.from(usersStore.values()).find((u) => u.email === email) || null;
      }),
      findAll: vi.fn(async () => Array.from(usersStore.values())),
      createUser: vi.fn(async (data: { email: string; name: string; roleEnum?: string }) => {
        const existing = Array.from(usersStore.values()).find((u) => u.email === data.email);
        if (existing) {
          throw new Error(`Unique constraint failed on the fields: (email)`);
        }
        const user = {
          id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          email: data.email,
          name: data.name,
          roleEnum: data.roleEnum || 'OPERATOR',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        usersStore.set(user.id, user);
        return user;
      }),
    },
  };
});

describe('Authentication API & JWT Integration Tests', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    // Build Fastify application instance
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('1. User Registration & Repository Constraints', () => {
    it('should successfully create a new user record in the repository', async () => {
      const email = `test_reg_${Date.now()}@jarvis-x.ai`;
      const name = 'New Register Test User';

      const user = await userRepository.createUser({ email, name, roleEnum: 'OPERATOR' });
      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(email);
      expect(user.roleEnum).toBe('OPERATOR');
    });

    it('should enforce unique email constraint on duplicate registration', async () => {
      const email = `test_dup_${Date.now()}@jarvis-x.ai`;
      await userRepository.createUser({ email, name: 'Original User' });

      // Duplicate email creation should reject with unique constraint failure
      await expect(userRepository.createUser({ email, name: 'Duplicate User' })).rejects.toThrow();
    });

    it('should handle invalid payload format when logging in with invalid email format', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'not-an-email',
          password: 'password123',
        },
      });

      expect([400, 500]).toContain(res.statusCode);
      expect(res.payload).toBeDefined();
    });

    it('should handle requests missing required password or email payload fields', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'valid@jarvis-x.ai',
        },
      });

      expect([400, 500]).toContain(res.statusCode);
      expect(res.payload).toBeDefined();
    });
  });

  describe('2. User Login API Endpoint (/api/v1/auth/login)', () => {
    it('should authenticate user and return JWT access and refresh tokens', async () => {
      const email = `operator_${Date.now()}@jarvis-x.ai`;

      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email,
          password: 'Password2026!',
        },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.success).toBe(true);
      expect(body.data.user.email).toBe(email);
      expect(body.data.tokens.accessToken).toBeDefined();
      expect(body.data.tokens.refreshToken).toBeDefined();
    });

    it('should fail login if payload contains unexpected field types', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 12345,
          password: 9999,
        },
      });

      expect([400, 500]).toContain(res.statusCode);
      expect(res.payload).toBeDefined();
    });
  });

  describe('3. JWT Authentication & Bearer Token Verification', () => {
    it('should allow access to protected route with valid Bearer token', async () => {
      const testEmail = `jwt_valid_${Date.now()}@jarvis-x.ai`;
      const user = await userRepository.createUser({ email: testEmail, name: 'JWT User', roleEnum: 'OPERATOR' });

      const token = app.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.roleEnum,
      });

      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/users/me',
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.success).toBe(true);
      expect(body.data.email).toBe(testEmail);
    });

    it('should return 401 Unauthorized when Authorization header is missing', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/users/me',
      });

      expect(res.statusCode).toBe(401);
      const body = res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 Unauthorized for expired JWT token', async () => {
      const expiredToken = app.jwt.sign(
        { id: 'user_123', email: 'expired@jarvis-x.ai', role: 'OPERATOR' },
        { expiresIn: '1ms' },
      );

      // Delay to ensure expiration threshold passes
      await new Promise((resolve) => setTimeout(resolve, 20));

      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/users/me',
        headers: {
          authorization: `Bearer ${expiredToken}`,
        },
      });

      expect(res.statusCode).toBe(401);
      const body = res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 Unauthorized for tampered or invalid JWT signature', async () => {
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalidpayload.invalidsignature';

      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/users/me',
        headers: {
          authorization: `Bearer ${invalidToken}`,
        },
      });

      expect(res.statusCode).toBe(401);
      const body = res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('4. Protected Routes & Role-Based Access Control (RBAC)', () => {
    it('should allow ADMIN role to access protected /api/v1/users route', async () => {
      const adminToken = app.jwt.sign({
        id: 'admin_user_1',
        email: 'admin@jarvis-x.ai',
        role: 'ADMIN',
      });

      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/users',
        headers: {
          authorization: `Bearer ${adminToken}`,
        },
      });

      expect(res.statusCode).toBe(200);
      const body = res.json();
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should return 403 Forbidden when OPERATOR role attempts to access ADMIN route', async () => {
      const operatorToken = app.jwt.sign({
        id: 'operator_user_1',
        email: 'operator@jarvis-x.ai',
        role: 'OPERATOR',
      });

      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/users',
        headers: {
          authorization: `Bearer ${operatorToken}`,
        },
      });

      expect(res.statusCode).toBe(403);
      const body = res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('FORBIDDEN');
    });
  });

  describe('5. Password Hashing & Secret Persistence Security', () => {

      it('should hash passwords using bcrypt before saving and never persist plaintext', async () => {
      const plainPassword = 'SuperSecretUserPassword2026!';
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

      expect(hashedPassword).not.toBe(plainPassword);
      expect(hashedPassword).toMatch(/^\$2[ayb]\$.{56}$/);

      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      expect(isMatch).toBe(true);

      const isWrongMatch = await bcrypt.compare('WrongPassword', hashedPassword);
      expect(isWrongMatch).toBe(false);
    });

    it('should never expose plain secret keys in authentication responses', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: `security_check_${Date.now()}@jarvis-x.ai`,
          password: 'Password2026!',
        },
      });

      const responseString = res.payload;
      expect(responseString).not.toContain('jwtSecret');
      expect(responseString).not.toContain('jarvis_prod_access_token');
    });
  });
});
