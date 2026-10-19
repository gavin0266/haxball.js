import 'haxball-headless-browser';

interface HaxballJSConfig {
  webrtc?: any;
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
interface TestableRoom extends RoomObject { readonly testing?: TestingApi; }
export class InvalidRoomTokenError extends Error {}
export type Headless = (roomConfig: RoomConfigObjectM) => TestableRoom;

declare function HaxballJS(config?: HaxballJSConfig): Promise<Headless>;

export default HaxballJS;
