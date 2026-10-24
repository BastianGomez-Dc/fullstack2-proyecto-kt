import assert from 'node:assert/strict';
import { test } from 'node:test';
import { confirmarRegistro, mensajeDeRegistro, registrarUsuario } from '../src/api/registro.ts';

test('registrarUsuario envía nombre, correo y contraseña a /api/auth/registro, sin rol', async () => {
  let peticion;
  globalThis.fetch = async (url, opciones) => {
    peticion = { url, opciones };
    return new Response(
      JSON.stringify({ id: 7, username: 'sub-1', nombre: 'Ana', email: 'ana@syncpass.cl', rol: 'BENEFICIARIO', activo: true }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    );
  };

  const usuario = await registrarUsuario({ nombre: 'Ana', email: 'ana@syncpass.cl', password: 'Clave#2026' });

  assert.equal(peticion.url, '/api/auth/registro');
  assert.equal(peticion.opciones.method, 'POST');
  assert.deepEqual(JSON.parse(peticion.opciones.body), { nombre: 'Ana', email: 'ana@syncpass.cl', password: 'Clave#2026' });
  assert.equal(usuario.rol, 'BENEFICIARIO');
});

test('confirmarRegistro acepta la respuesta 204 sin cuerpo', async () => {
  globalThis.fetch = async () => new Response(null, { status: 204 });

  await confirmarRegistro('ana@syncpass.cl', '123456');
});

test('mensajeDeRegistro muestra el error del backend o uno de conexión', async () => {
  globalThis.fetch = async () => new Response(
    JSON.stringify({ error: 'Ya existe una cuenta con ese email' }),
    { status: 409, headers: { 'Content-Type': 'application/json' } },
  );

  const error = await registrarUsuario({ nombre: 'Ana', email: 'ana@syncpass.cl', password: 'Clave#2026' }).catch((e) => e);

  assert.equal(mensajeDeRegistro(error), 'Ya existe una cuenta con ese email');
  assert.match(mensajeDeRegistro(new TypeError('Failed to fetch')), /No pudimos conectar/);
});
