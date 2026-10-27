// Independent of the archive recorder. No transport or player connection data.
function createLiveReplay({ dispatcher, Writer, pack, compress, sanitize, defer = queueMicrotask }) {
  let listener = null, segmentFrames = 120, start = 0, previous = 0, initial, events;
  const MAX_BYTES = 2 * 1024 * 1024;
  function reset() {
    start = previous = dispatcher.da;
    const writer = Writer.aa();
    dispatcher.Fa.G(writer);
    initial = writer.Bb().slice();
    events = Writer.aa();
  }
  function discard() { listener = null; initial = events = null; }
  const api = Object.freeze({
    version: 1,
    subscribe(callback, options = {}) {
      if (typeof callback !== 'function') throw new TypeError('A live replay callback is required');
      if (listener) throw new Error('A live replay subscription is already active');
      segmentFrames = options.segmentFrames ?? 120;
      if (!Number.isInteger(segmentFrames) || segmentFrames < 30 || segmentFrames > 300) throw new RangeError('Live segments must contain 30–300 frames');
      reset(); listener = callback;
      return () => { if (listener === callback) discard(); };
    },
  });
  function event(action) {
    if (!listener) return;
    try {
      const clean = sanitize(action);
      if (!clean) return;
      events.Da(dispatcher.da - previous); previous = dispatcher.da;
      events.Oa(clean.B); pack(clean, events);
      if (events.a + initial.length > MAX_BYTES) discard();
    } catch { discard(); } // Broadcasting must never interrupt the room.
  }
  function tick() {
    if (!listener || dispatcher.da - start < segmentFrames) return;
    try {
      const payload = new Uint8Array(2 + initial.length + events.a);
      payload.set(initial, 2); // uint16 goal-marker count = 0
      payload.set(events.Bb(), 2 + initial.length);
      const compressed = compress(payload);
      const bytes = new Uint8Array(12 + compressed.length), header = new DataView(bytes.buffer);
      header.setUint32(0, 0x48425232); header.setUint32(4, 3); header.setUint32(8, dispatcher.da - start);
      bytes.set(compressed, 12);
      const target = listener, packet = Object.freeze({ from: start, to: dispatcher.da, bytes });
      reset();
      defer(() => { if (listener === target) { try { target(packet); } catch { /* isolate consumers */ } } });
    } catch { discard(); }
  }
  return { api, event, tick };
}
module.exports = { createLiveReplay };
