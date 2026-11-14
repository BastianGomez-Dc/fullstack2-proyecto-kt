import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ApiError } from '../src/api/client.ts';
import { enviarNotificacionManual, getHistorial } from '../src/api/notifications.ts';

test('enviarNotificacionManual envía el token y los roles seleccionados al endpoint', async () => {
  let peticion;
  globalThis.fetch = async (url, opciones) => {
    peticion = { url, opciones };
    return new Response(
      JSON.stringify({ mensaje: 'Notificación enviada', enviadoEn: '2026-11-13T22:00:00' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  };

  const respuesta = await enviarNotificacionManual(
    { titulo: 'Aviso', cuerpo: 'Mensaje', roles: ['VOLUNTARIO'] },
    'jwt-de-prueba',
  );

  assert.equal(peticion.url, '/api/notifications/manual');
  assert.equal(peticion.opciones.method, 'POST');
  assert.equal(peticion.opciones.headers.Authorization, 'Bearer jwt-de-prueba');
  assert.deepEqual(JSON.parse(peticion.opciones.body), {
    titulo: 'Aviso',
    cuerpo: 'Mensaje',
    roles: ['VOLUNTARIO'],
  });
  assert.equal(respuesta.mensaje, 'Notificación enviada');
});

test('enviarNotificacionManual permite roles vacíos para notificar a todos', async () => {
  let cuerpo;
  globalThis.fetch = async (_url, opciones) => {
    cuerpo = JSON.parse(opciones.body);
    return new Response(
      JSON.stringify({ mensaje: 'Notificación enviada', enviadoEn: '2026-11-13T22:00:00' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  };

  await enviarNotificacionManual({ titulo: 'Aviso', cuerpo: 'Mensaje', roles: [] }, 'jwt');
  assert.deepEqual(cuerpo.roles, []);
});

test('enviarNotificacionManual conserva el error de permisos 403', async () => {
  globalThis.fetch = async () => new Response(
    JSON.stringify({ error: 'No tienes permisos para realizar esta acción.' }),
    { status: 403, headers: { 'Content-Type': 'application/json' } },
  );

  await assert.rejects(
    () => enviarNotificacionManual({ titulo: 'Aviso', cuerpo: 'Mensaje', roles: [] }, 'jwt'),
    (error) => error instanceof ApiError && error.status === 403,
  );
});

test('getHistorial envía el token y acepta el array vacío del backend', async () => {
  let peticion;
  globalThis.fetch = async (url, opciones) => {
    peticion = { url, opciones };
    return new Response('[]', { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  assert.deepEqual(await getHistorial('jwt-de-prueba'), []);
  assert.equal(peticion.url, '/api/notifications/historial');
  assert.equal(peticion.opciones.headers.Authorization, 'Bearer jwt-de-prueba');
});
