import assert from 'node:assert/strict';
import { test } from 'node:test';
import { onSigninCallback } from '../src/auth/cognito.ts';

test('el callback elimina la respuesta OIDC y conserva la ruta y otros parámetros', () => {
  const originalWindow = globalThis.window;
  let destination;
  globalThis.window = {
    location: { href: 'https://d84l1y8p4kdic.cloudfront.net/?code=secret&state=state&session_state=session&producto=1#catalogo' },
    history: {
      state: null,
      replaceState(_state, _title, url) { destination = String(url); },
    },
  };
  try {
    onSigninCallback();
    assert.equal(destination, 'https://d84l1y8p4kdic.cloudfront.net/?producto=1#catalogo');
  } finally {
    globalThis.window = originalWindow;
  }
});
