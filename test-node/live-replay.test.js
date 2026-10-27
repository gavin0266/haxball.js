const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const pako = require('pako');
const { createLiveReplay } = require('../src/live-replay');
function engine() {
  const source = fs.readFileSync(require.resolve('../src/index'), 'utf8');
  const body = source.slice(source.indexOf('(function (va)'), source.indexOf('module.exports = HBLoaded;'));
  assert.equal(body.split('  F.sh();').length, 2);
  const context = { ArrayBuffer, Uint8Array, Uint16Array, Int32Array, DataView, Float32Array, Map, Set, performance, pako, createLiveReplay };
  context.global = context; vm.createContext(context);
  vm.runInContext(body.replace('  F.sh();', '  rb.Ci(); globalThis.engine = { State:Pa, Dispatcher:La, Recorder:Wa, Join:Z, Team:aa, Input:Ca, Pause:oa, Start:ma, Teams:u, Chat:la, Announcement:Y, Remove:S, liveReplayFor };'), context);
  const e = context.engine, state = new e.State(), dispatcher = new e.Dispatcher(state);
  dispatcher.liveReplay = e.liveReplayFor(dispatcher);
  const apply = (event, by = 0) => { event.B = by; event.eb = dispatcher.da; event.fb = dispatcher.Ra; dispatcher.Bf(event); };
  return { e, dispatcher, state, apply, tick: count => dispatcher.rg(count) };
}
test('live native segments match the ordinary recorder and survive archive start/stop', async () => {
  const { e, dispatcher, apply, tick } = engine(), packets = [];
  const unsubscribe = dispatcher.liveReplay.api.subscribe(p => packets.push(p));
  let archive = new e.Recorder(dispatcher, 3);
  apply(e.Join.V(1, 'Red fixture', 'au', null)); apply(e.Join.V(2, 'Blue fixture', 'au', null));
  apply(e.Team.V(1, e.Teams.fa)); apply(e.Team.V(2, e.Teams.ta)); apply(new e.Start());
  let input = new e.Input(); input.input = 8; apply(input, 1); tick(120);
  const first = archive.stop(); await Promise.resolve();
  assert.equal(packets.length, 1); assert.deepEqual(Buffer.from(packets[0].bytes), Buffer.from(first));
  archive = new e.Recorder(dispatcher, 3);
  const pause = new e.Pause(); pause.wc = true; apply(pause); tick(120);
  const second = archive.stop(); await Promise.resolve();
  assert.equal(packets.length, 2); assert.deepEqual(Buffer.from(packets[1].bytes), Buffer.from(second));
  assert.equal(packets[1].from, packets[0].to);
  unsubscribe(); tick(120); await Promise.resolve(); assert.equal(packets.length, 2);
});
test('viewing excludes chat, announcements, moderator reasons and connection identities', async () => {
  const { e, dispatcher, apply, tick } = engine(), packets = [];
  dispatcher.liveReplay.api.subscribe(p => packets.push(p), { segmentFrames: 30 });
  apply(e.Join.V(1, 'Safe fixture', 'au', null));
  const chat = new e.Chat(); chat.Pa = '!link SECRET-CODE'; apply(chat, 1);
  apply(e.Announcement.V('private-key-secret', 0xffffff, 0, 0));
  apply(e.Remove.V(1, 'sensitive-moderator-reason', true)); tick(30); await Promise.resolve();
  const payload = Buffer.from(pako.inflateRaw(packets[0].bytes.subarray(12))).toString('utf8');
  assert.ok(payload.includes('Safe fixture'));
  for (const value of ['SECRET-CODE', 'private-key-secret', 'sensitive-moderator-reason']) assert.ok(!payload.includes(value));
});
test('subscription validation, cancellation and consumer errors do not stop simulation', async () => {
  const { dispatcher, tick } = engine();
  assert.throws(() => dispatcher.liveReplay.api.subscribe(null));
  for (const frames of [0, 29, 301, 2.5]) assert.throws(() => dispatcher.liveReplay.api.subscribe(() => {}, { segmentFrames: frames }));
  const stop = dispatcher.liveReplay.api.subscribe(() => { throw Error('consumer'); });
  assert.throws(() => dispatcher.liveReplay.api.subscribe(() => {}));
  tick(240); await Promise.resolve(); assert.equal(dispatcher.da, 240); stop();
  let calls = 0;
  const cancel = dispatcher.liveReplay.api.subscribe(() => calls++);
  tick(120); cancel(); await Promise.resolve(); assert.equal(calls, 0);
});
