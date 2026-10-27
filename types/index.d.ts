import 'haxball-headless-browser';

interface HaxballJSConfig {
  webrtc?: any;
  proxy?: string;
}

interface RoomConfigObjectM extends RoomConfigObject {
  token: string;
  proxy?: string;
  debug?: boolean;
  /** Enables engine participant APIs; public rooms are rejected. */
  testMode?: boolean;
}

interface TestPlayerOptions { name: string; auth?: string | null; conn?: string; country?: string; }
interface TestingApi {
  addPlayer(options: TestPlayerOptions): number;
  removePlayer(id: number): void;
  setPlayerInput(id: number, input: number): Promise<boolean>;
  sendChat(id: number, message: string): Promise<boolean>;
  pauseGame(id: number, value: boolean): Promise<boolean>;
}
interface LiveReplaySegment { readonly from: number; readonly to: number; readonly bytes: Uint8Array; }
interface LiveReplayApi {
  readonly version: 1;
  /** Native version 3 segments. Chat and announcements are omitted. */
  subscribe(callback: (segment: LiveReplaySegment) => void, options?: { segmentFrames?: number }): () => void;
}
interface TestableRoom extends RoomObject { readonly testing?: TestingApi; readonly liveReplay: LiveReplayApi; }
export class InvalidRoomTokenError extends Error {}
export const testingApiVersion: number;
export type Headless = (roomConfig: RoomConfigObjectM) => TestableRoom;

declare function HaxballJS(config?: HaxballJSConfig): Promise<Headless>;

export default HaxballJS;
