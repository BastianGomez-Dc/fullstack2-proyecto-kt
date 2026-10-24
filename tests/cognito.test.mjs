import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mensajeDeError, mensajeDePaso, usuarioDesdeClaims } from '../src/auth/cognito.ts';

test('usuarioDesdeClaims prefiere el correo cuando cognito:username es un UUID', () => {
  const usuario = usuarioDesdeClaims({
    sub: 'a1b2',
    'cognito:username': 'a1b2',
    email: 'juan@syncpass.cl',
    name: 'Juan Pérez',
    'cognito:groups': ['COORDINADOR'],
  });

  assert.deepEqual(usuario, { id: 'a1b2', username: 'juan@syncpass.cl', nombre: 'Juan Pérez', rol: 'COORDINADOR' });
});

test('usuarioDesdeClaims usa cognito:username si no hay correo ni grupos', () => {
  const usuario = usuarioDesdeClaims({ sub: 'a1b2', 'cognito:username': 'juan_perez' });

  assert.equal(usuario.username, 'juan_perez');
  assert.equal(usuario.rol, undefined);
});

test('mensajeDeError traduce los errores de Cognito y usa uno genérico para el resto', () => {
  const credenciales = Object.assign(new Error('Incorrect username or password.'), { name: 'NotAuthorizedException' });

  assert.equal(mensajeDeError(credenciales), 'El usuario o la contraseña no son correctos.');
  assert.match(mensajeDeError(new TypeError('Failed to fetch')), /Revisa tu conexión/);
});

test('mensajeDePaso avisa cuando la cuenta tiene una contraseña temporal', () => {
  assert.match(mensajeDePaso('CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED'), /contraseña temporal/);
});
