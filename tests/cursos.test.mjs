import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ApiError } from '../src/api/client.ts';
import {
  crearCurso,
  desactivarCurso,
  editarCurso,
  listarCursos,
  obtenerCurso,
} from '../src/api/cursos.ts';

const CURSO = {
  id: 8,
  titulo: 'Alfabetización Digital',
  descripcion: 'Uso de herramientas digitales',
  areaTematica: 'Educación',
  unidadVecinal: 'UV 01',
  fechaInicio: '2026-01-15',
  fechaTermino: '2026-06-30',
  estado: 'EN_CURSO',
};

test('listarCursos incluye el JWT y obtiene el catálogo activo', async () => {
  let peticion;
  globalThis.fetch = async (url, opciones) => {
    peticion = { url, opciones };
    return new Response(JSON.stringify([CURSO]), { status: 200 });
  };

  assert.deepEqual(await listarCursos('jwt'), [CURSO]);
  assert.equal(peticion.url, '/api/cursos');
  assert.equal(peticion.opciones.headers.Authorization, 'Bearer jwt');
});

test('obtenerCurso consulta el detalle por id', async () => {
  let url;
  globalThis.fetch = async (requestUrl) => {
    url = requestUrl;
    return new Response(JSON.stringify(CURSO), { status: 200 });
  };

  assert.deepEqual(await obtenerCurso(8, 'jwt'), CURSO);
  assert.equal(url, '/api/cursos/8');
});

test('crearCurso envía el contrato esperado mediante POST', async () => {
  let peticion;
  globalThis.fetch = async (url, opciones) => {
    peticion = { url, opciones };
    return new Response(JSON.stringify(CURSO), { status: 201 });
  };
  const datos = {
    titulo: CURSO.titulo,
    descripcion: CURSO.descripcion,
    areaTematica: CURSO.areaTematica,
    unidadVecinal: CURSO.unidadVecinal,
    fechaInicio: CURSO.fechaInicio,
    fechaTermino: CURSO.fechaTermino,
    estado: CURSO.estado,
  };

  assert.deepEqual(await crearCurso(datos, 'jwt'), CURSO);
  assert.equal(peticion.url, '/api/cursos');
  assert.equal(peticion.opciones.method, 'POST');
  assert.equal(peticion.opciones.headers.Authorization, 'Bearer jwt');
  assert.deepEqual(JSON.parse(peticion.opciones.body), datos);
});

test('editarCurso actualiza campos mediante PUT', async () => {
  let peticion;
  globalThis.fetch = async (url, opciones) => {
    peticion = { url, opciones };
    return new Response(JSON.stringify(CURSO), { status: 200 });
  };

  await editarCurso(8, { titulo: 'Nuevo título' }, 'jwt');
  assert.equal(peticion.url, '/api/cursos/8');
  assert.equal(peticion.opciones.method, 'PUT');
  assert.deepEqual(JSON.parse(peticion.opciones.body), { titulo: 'Nuevo título' });
});

test('desactivarCurso usa PATCH en la ruta de desactivación', async () => {
  let peticion;
  globalThis.fetch = async (url, opciones) => {
    peticion = { url, opciones };
    return new Response(null, { status: 204 });
  };

  await desactivarCurso(8, 'jwt');
  assert.equal(peticion.url, '/api/cursos/8/desactivar');
  assert.equal(peticion.opciones.method, 'PATCH');
  assert.equal(peticion.opciones.headers.Authorization, 'Bearer jwt');
});

test('las operaciones conservan los errores de autorización del backend', async () => {
  globalThis.fetch = async () => new Response(
    JSON.stringify({ error: 'Se requiere el rol ADMINISTRADOR', status: 403 }),
    { status: 403 },
  );

  await assert.rejects(
    () => crearCurso({
      titulo: CURSO.titulo,
      areaTematica: CURSO.areaTematica,
      unidadVecinal: CURSO.unidadVecinal,
      fechaInicio: CURSO.fechaInicio,
      fechaTermino: CURSO.fechaTermino,
      estado: 'PLANIFICADO',
    }, 'jwt'),
    (error) => error instanceof ApiError && error.status === 403 && error.message === 'Se requiere el rol ADMINISTRADOR',
  );
});
