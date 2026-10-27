# Native live viewing: development evidence

Companion PRs: [haxballjs #2](https://github.com/gavin0266/haxball.js/pull/2), [APL #15](https://github.com/gavin0266/apl-football/pull/15), [HaxballAsia #52](https://github.com/KnitidCeladon23/next_haxballasia/pull/52). This report and the actual screenshots are stored independently in each PR's repository.

## Checked source and environment

Native fork: **a13c08797ce1e84dc05de3db2b708791100e661b**. APL room/publisher: **c8b35c5ddd831b8f7a29b81bd40f671319d969a5**. Captured website runtime: **4012949c16a0fa46442f0d01b2b952c44e4e4c3d**. Later evidence-only commits do not change these runtime sources. Captures and assertions are timestamped in UTC in [capture metadata](live-viewing/captures.json) and [live-run proof](live-viewing/real-room.json).

The website ran at localhost port 3107 with the actual production live-router module hosted in an isolated Express harness on loopback port 4107. This harness contains the new relay, without the unrelated database-backed routes. These checks did not replace API responses or intercept live requests. The source was a **real, unlisted, password-protected native Haxball room**, opened through the existing Capsolver integration at 2026-10-27T12:50:36.550Z. Its two clearly labelled players were the fork's engine-driven test participants, rather than two human or WebRTC player clients. Separate native peer verification is described below. No production match records, account credentials or database data were used.

This is verified **local development** evidence. Hosted development deployment and production activation have not occurred. A development-only checked deployment was prepared, but automatic approval review required explicit release authorization; it remains pending. The read-only baseline confirmed development c62dd0d and production 1.1.1 (40933f3) healthy. No deployment, environment change, merge or production activation was performed.

## Actual live behavior

At **2026-10-27T13:33:57.537Z**, desktop Edge rendered the actual APL stadium, names, team colors, ball, native camera and game state. During the observed interval the native game clock advanced from **2570.767 s** to **2579.850 s**, and the absolute live playback frame advanced **560 frames** across multiple native segments. Test Red's x position changed from **-473.777** to **-418.105**. The page had **0 JavaScript errors**.

Pause held the native reader, Return to live resumed it, and the native viewport selector applied the full 1x mode. Desktop 1440x1000 and mobile-width 390x844 captures passed page-width checks. Mobile-width Edge is not physical iPhone or Safari proof. The same actual relay returned 404 for an unavailable broadcast; that UI was captured separately. Header/clock and paused status are outer UI; the pitch is the original Haxball canvas, not a mock or custom renderer.

At **2026-10-27T13:12:24.897Z**, a separate native haxball.com client successfully joined the same private room as **Live Peer Spectator** over its real WebRTC path. The host's join welcome, live native game clock and ping HUD were observed. [Native peer proof](live-viewing/native-peer.json) and the actual native-client capture record this separately; the viewer-only run itself did not open that peer.

## Automated checks and actual limitations

| Check | Observed result |
| --- | --- |
| Fork native-engine/participant contracts | 6 passed locally; Linux and Windows CI passed. Native segment bytes equal ordinary archive recording, including archive start/stop; privacy filtering and consumer/cancellation cases covered. |
| APL npm test | Passed: 207 Node test cases, 66 stadium checks and 631 engine/harness checks, plus included standalone performance/provider/Fleet checks. No Node skips or failures. |
| APL Linux CI | Native fork preflight, supervisor lifecycle and account dashboard checks passed in addition to source/history/offline checks. |
| HaxballAsia backend units | 633 passed, 3 existing database-gated skips; no failures. |
| HaxballAsia frontend units | 98 passed, no skips or failures. |
| TypeScript | Passed. |
| Local Chromium live-view regressions | 2 passed: native segment transitions, local pause/live-edge, viewport/fullscreen, unavailable state. |
| Local Windows WebKit | 1 unavailable/retry case passed; native playback case explicitly skipped after verifying the visible missing-Web-Audio error. This WebKit build lacks both AudioContext APIs. It is not reported as successful Safari playback. |
| Real room/native renderer integration | Passed against actual native data and real local HTTP relay/proxy with no live API interception; zero page errors. |

Initial runs exposed and fixed a page/iframe startup handshake race, an ambiguous view selector label, a sound-setting call before native audio initialization, an error that polling could clear, and clipped mobile error text. The first mobile browser launch failed because the locked WebKit executable was absent; installing it revealed its real Web Audio limitation. These failed attempts are not counted as passed tests. Physical iPhone Safari, sustained high-viewer load, distributed relays and production rollout were not tested.

Initial successful CI runs are recorded in [CI metadata](live-viewing/initial-ci.json). Final source/head checks are linked in each PR description; this report does not describe an older run as testing a newer source revision. Source revisions remain explicit above.

## Operations and review

Both flags default off. Private broadcasting requires a second explicit unlisted opt-in, and unlisted feeds stay out of discovery. Chat, announcements and moderator removal reasons are omitted at capture. The relay uses authenticated writes, read-only website proxies, bounded memory, sequence/frame validation, inflate limits and stale-feed expiry. Live-route access logging is suppressed; viewing URLs, native invites, passwords, tokens, auth/conn/IP and publishing keys are excluded from committed proof.

Deployment order is compatible website/backend, then the pinned APL package, then explicit development flags. Production is a separate authorization and release. No schema migration is introduced. The relay is process-local and requires one backend instance or sticky routing; it provides a short playback buffer rather than persistent DVR. Callback network work is queued by APL rather than blocking the native dispatcher.

## Actual captures

![Real private-room feed in the native desktop viewer](live-viewing/01-native-live-desktop.png)

![Real feed at a mobile width in Edge](live-viewing/02-native-live-mobile.png)

![Separate real native WebRTC spectator client](live-viewing/03-real-native-peer.png)

![Actual unavailable-broadcast state](live-viewing/04-unavailable.png)

![Actual unsupported Web Audio state in Windows WebKit](live-viewing/05-webkit-unsupported.png)
