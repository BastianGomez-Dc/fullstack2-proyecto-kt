import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apiRequest, ApiError } from '../src/api/client.ts';

test('apiRequest devuelve la respuesta exitosa del backend', async () => {
  globalThis.fetch = async () => new Response(
    JSON.stringify({ token: 'token-de-prueba', usuario: { id: '1', username: 'juan_perez', rol: 'COORDINADOR' } }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );

  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: { username: 'juan_perez', password: 'Password123' },
  });

  assert.equal(data.token, 'token-de-prueba');
});

test('apiRequest lanza ApiError con el mensaje del backend cuando la respuesta falla', async () => {
  globalThis.fetch = async () => new Response(
    JSON.stringify({ error: 'El usuario o la contraseña no son correctos.' }),
    { status: 401, headers: { 'Content-Type': 'application/json' } },
  );

  await assert.rejects(
    () => apiRequest('/auth/login', { method: 'POST', body: { username: 'juan_perez', password: 'incorrecta' } }),
    (error) => error instanceof ApiError && error.message === 'El usuario o la contraseña no son correctos.',
  );
});
