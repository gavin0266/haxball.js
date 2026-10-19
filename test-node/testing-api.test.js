const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createTestingApi } = require('../src/testing');
function fixture() {
  let id = 1;
  const live = new Set(), calls = [];
  const api = createTestingApi({ allocateId: () => id++, exists: id => live.has(id),
    add: (...args) => { live.add(args[0]); calls.push(['add', ...args]); },
    remove: id => { live.delete(id); calls.push(['remove', id]); },
    input: (...args) => calls.push(['input', ...args]), chat: (...args) => calls.push(['chat', ...args]),
    pause: (...args) => calls.push(['pause', ...args]),
  });
  return { api, calls };
}
test('participants use fresh ids and preserve a supplied reconnect identity', () => {
  const { api, calls } = fixture();
  const first = api.addPlayer({ name: 'Player', auth: 'same-identity' });
  api.removePlayer(first); api.forget(first);
  const second = api.addPlayer({ name: 'Renamed', auth: 'same-identity' });
  assert.notEqual(first, second); assert.equal(api.identity(second).auth, 'same-identity');
  assert.equal(calls.filter(c => c[0] === 'add').length, 2);
});
test('input, chat and native pause are sent as player actions', () => {
  const { api, calls } = fixture(), id = api.addPlayer({ name: 'Admin' });
  api.setPlayerInput(id, 24); api.sendChat(id, '!league'); api.pauseGame(id, false);
  assert.deepEqual(calls.slice(1), [['input', id, 24], ['chat', id, '!league'], ['pause', id, false]]);
});
test('invalid player options and inputs never reach the dispatcher', () => {
  const { api, calls } = fixture();
  for (const name of ['', 'x'.repeat(26), null]) assert.throws(() => api.addPlayer({ name }));
  assert.equal(calls.length, 0);
  const id = api.addPlayer({ name: 'Player', auth: null });
  for (const input of [-1, 32, 1.2, NaN]) assert.throws(() => api.setPlayerInput(id, input));
  assert.throws(() => api.sendChat(id, 'x'.repeat(141)));
  assert.throws(() => api.pauseGame(id, 'false'));
  assert.throws(() => api.removePlayer(999));
  api.removePlayer(id); api.forget(id); assert.throws(() => api.sendChat(id, 'hello'));
});
