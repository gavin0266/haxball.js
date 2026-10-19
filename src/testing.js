// Opt-in engine participants. These actions use the same dispatcher and replay
// recorder as connected players, but do not establish external WebRTC sessions.
const { randomUUID } = require('node:crypto');

function createTestingApi(engine) {
  const players = new Map();
  const requirePlayer = (id) => {
    if (!players.has(id) || !engine.exists(id)) throw new Error('No such test player');
  };
  const text = (value, max, label) => {
    if (typeof value !== 'string' || !value.length || value.length > max) throw new Error(`Invalid ${label}`);
    return value;
  };
  return Object.freeze({
    addPlayer({ name, auth = `test:${randomUUID()}`, conn = 'test-connection', country = 'au' } = {}) {
      text(name, 25, 'player name');
      if (auth !== null) text(auth, 200, 'auth');
      text(conn, 200, 'connection'); text(country, 3, 'country');
      const id = engine.allocateId();
      players.set(id, { auth, conn });
      engine.add(id, name, country);
      return id;
    },
    removePlayer(id) { requirePlayer(id); return engine.remove(id); },
    setPlayerInput(id, input) {
      requirePlayer(id);
      if (!Number.isInteger(input) || input < 0 || input > 31) throw new Error('Invalid player input');
      return engine.input(id, input);
    },
    sendChat(id, message) { requirePlayer(id); text(message, 140, 'chat message'); return engine.chat(id, message); },
    pauseGame(id, value) {
      requirePlayer(id);
      if (typeof value !== 'boolean') throw new Error('Invalid pause state');
      return engine.pause(id, value);
    },
    // Called by the engine's ordinary join/leave callbacks, never by the test runner.
    identity(id) { return players.get(id); },
    forget(id) { players.delete(id); },
  });
}

module.exports = { createTestingApi };
