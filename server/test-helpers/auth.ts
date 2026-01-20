/**
 * Helpers de autenticación para tests
 * 
 * Proporciona utilidades para simular autenticación en tests de integración
 * sin necesidad de flujo OAuth completo.
 */

import { User } from "../../drizzle/schema";

/**
 * Datos del usuario de prueba creado por seed_test_user.ts
 */
export const TEST_USER = {
  id: 1440009,
  openId: "test_user_aresk_obs",
  name: "Usuario de Prueba ARESK-OBS",
  email: "test@aresk-obs.demo",
  loginMethod: "test",
  role: "user" as const
};

/**
 * IDs de sesiones de prueba creadas por seed_test_user.ts
 */
export const TEST_SESSIONS = {
  ACOPLADA: 450002,
  TIPO_A: 450003,
  TIPO_B: 450004
};

/**
 * Crea un contexto de usuario autenticado para tests
 */
export function createAuthContext(user: Partial<User> = TEST_USER) {
  return {
    user: {
      id: user.id ?? TEST_USER.id,
      openId: user.openId ?? TEST_USER.openId,
      name: user.name ?? TEST_USER.name,
      email: user.email ?? TEST_USER.email,
      loginMethod: user.loginMethod ?? TEST_USER.loginMethod,
      role: user.role ?? TEST_USER.role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date()
    } as User
  };
}

/**
 * Crea un contexto sin autenticación para tests
 */
export function createUnauthContext() {
  return {
    user: null
  };
}

/**
 * Mock de request con cookie de sesión
 */
export function createMockRequest(userId?: number) {
  return {
    cookies: userId ? { session: `mock_session_${userId}` } : {},
    headers: {},
    method: "POST",
    url: "/api/trpc"
  };
}

/**
 * Mock de response para tests
 */
export function createMockResponse() {
  const cookies: Record<string, string> = {};
  
  return {
    cookie: (name: string, value: string) => {
      cookies[name] = value;
    },
    clearCookie: (name: string) => {
      delete cookies[name];
    },
    getCookies: () => cookies
  };
}
