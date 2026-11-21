import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import { createServer, request } from "node:http";
import { setTimeout as sleep } from "node:timers/promises";
import { until, withChrome } from "./chrome.mjs";

const nextPort = process.env.TEST_NEXT_PORT || 17675;
const next = spawn(
  process.execPath,
  [
    "--import",
    "./tests/mock-anilist.mjs",
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    nextPort,
  ],
  { stdio: "inherit" },
);

let failPrimary = true;
let requestedEpisode2 = false;
let completedEpisode2 = false;
let primaryManifestRequests = 0;
let origin;

const proxy = createServer(async (incoming, outgoing) => {
  const url = new URL(incoming.url, origin);
  if (url.pathname === "/api/stream") {
    const episode = Number(url.searchParams.get("episode"));
    if (episode === 2) {
      requestedEpisode2 = true;
      await sleep(2800);
      completedEpisode2 = true;
    }
    const servers = ["primary", "secondary"].map((id) => ({
      id,
      serverName: id === "primary" ? "Nguồn chính" : "Nguồn dự phòng",
      type: "m3u8",
      provider: "custom",
      embedUrl: "",
      m3u8Url: `${origin}/hls/${id}/clip.m3u8?ep=${episode}`,
    }));
    outgoing.setHeader("Content-Type", "application/json");
    outgoing.end(JSON.stringify({ success: true, episode, servers }));
    return;
  }
  if (url.pathname.startsWith("/hls/")) {
    const filename = url.pathname.split("/").at(-1);
    if (filename === "clip.m3u8" && url.pathname.includes("/primary/")) {
      primaryManifestRequests += 1;
      if (failPrimary) {
        outgoing.writeHead(404).end();
        return;
      }
    }
    const mime = {
      "clip.m3u8": "application/vnd.apple.mpegurl",
      "clip0.mpegts": "video/mp2t",
    };
    if (!Object.hasOwn(mime, filename)) {
      outgoing.writeHead(404).end();
      return;
    }
    outgoing.setHeader("Content-Type", mime[filename]);
    outgoing.end(
      await readFile(new URL(`./fixtures/hls/${filename}`, import.meta.url)),
    );
    return;
  }
  const upstream = request(
    {
      hostname: "127.0.0.1",
      port: nextPort,
      path: incoming.url,
      method: incoming.method,
      headers: incoming.headers,
    },
    (response) => {
      outgoing.writeHead(response.statusCode, response.headers);
      response.pipe(outgoing);
    },
  );
  upstream.on("error", () => outgoing.writeHead(502).end());
  outgoing.on("close", () => upstream.destroy());
  incoming.pipe(upstream);
});

const video = 'document.querySelector("video")';
const button = (label) =>
  `[...document.querySelectorAll('button')].find(button => button.textContent.trim() === ${JSON.stringify(label)})`;
const episode = (number) =>
  `[...document.querySelectorAll('button[title]')].find(button => button.title === "Tập ${number}" || button.title.startsWith("Tập ${number} -"))`;
try {
  await until(
    async () => (await fetch(`http://127.0.0.1:${nextPort}/`)).ok,
    "Next.js did not start",
  );
  await new Promise((resolve) => proxy.listen(0, "127.0.0.1", resolve));
  origin = `http://127.0.0.1:${proxy.address().port}`;
  await withChrome(async ({ navigate, evaluate, send }) => {
    const wait = (expression, message) =>
      until(() => evaluate(expression), message);
    const click = (selector) => evaluate(`${selector}.click()`);
    const ready = () =>
      wait(`${video}?.readyState >= 3`, "HLS video did not become playable");

    await navigate(`${origin}/anime/1/watch?ep=1`);
    await wait(
      button("Thử lại nguồn phát") + " != null",
      "Player did not render its recovery controls",
    );
    assert.ok(
      await evaluate(
        `document.querySelector('[role=alert]')?.textContent.includes("Nguồn dự phòng")`,
      ),
    );
    const failures = primaryManifestRequests;
    failPrimary = false;
    await click(button("Thử lại nguồn phát"));
    await ready();
    assert.ok(primaryManifestRequests > failures);

    await evaluate(`(() => {
      const range = document.querySelector('input[aria-label="Âm lượng"]');
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(range, "50");
      range.dispatchEvent(new Event("input", { bubbles: true }));
      ${video}.currentTime = 12;
      ${video}.dispatchEvent(new Event("timeupdate"));
    })()`);
    await wait(
      `${video}.volume === 0.5 && !${video}.seeking`,
      "Could not set volume and position",
    );
    await click(button("Nguồn dự phòng"));
    await ready();
    await wait(
      `Math.abs(${video}.currentTime - 12) < 0.5`,
      "Switching HLS sources did not restore playback position",
    );

    await navigate(`${origin}/anime/1/watch?ep=1`);
    await wait(
      button("Tua đến") + " != null",
      "Saved playback did not offer resume",
    );
    await ready();
    await click(button("Tua đến"));
    await wait(
      `${video}.currentTime >= 11.5`,
      "Resume did not seek into the saved episode",
    );

    await click(episode(2));
    await until(async () => requestedEpisode2, "Episode 2 was never requested");
    await click(episode(3));
    await ready();
    await until(
      async () => completedEpisode2,
      "Delayed response never finished",
    );
    assert.ok(
      await evaluate(
        'document.querySelector("fieldset")?.getAttribute("aria-label")?.startsWith("Tập 3")',
      ),
    );
    assert.equal(await evaluate(`${video}.volume`), 0.5);
    assert.ok(
      await evaluate(`${video}.currentTime < 8`),
      "A source checkpoint leaked into a different episode",
    );

    const autoplay =
      'Array.from(document.querySelectorAll("label")).find(label => label.textContent.trim() === "Tự phát tập tiếp theo").querySelector("input")';
    await click(autoplay);
    await navigate(`${origin}/anime/1/watch?ep=1`);
    await ready();
    assert.equal(await evaluate(`${autoplay}.checked`), false);
    await evaluate(`${video}.dispatchEvent(new Event("ended"))`);
    assert.equal(await evaluate(`Boolean(${button("Hủy tự phát")})`), false);
    await navigate(`${origin}/library?tab=history`);
    await wait(
      '[...document.querySelectorAll("main a")].some(link => link.textContent.trim() === "Xem tập tiếp theo · Tập 2" && link.getAttribute("href") === "/anime/1/watch?ep=2")',
      "Library did not link to the next released episode",
    );

    await navigate(`${origin}/anime/1/watch?ep=3`);
    await ready();
    const player = 'document.querySelector("fieldset")';
    const seekForward = `${player}.querySelector('button[aria-label="Tua tới 10 giây"]')`;
    const seekBack = `${player}.querySelector('button[aria-label="Tua lùi 10 giây"]')`;
    const controlsAreVisible = `Boolean(${seekForward}?.closest(".opacity-100"))`;
    const atTime = (time) =>
      wait(
        `Math.abs(${video}.currentTime - ${time}) < 0.5`,
        `Video did not seek to ${time}s`,
      );
    const pressArrow = async (key, windowsVirtualKeyCode) => {
      await send("Input.dispatchKeyEvent", {
        type: "rawKeyDown",
        key,
        code: key,
        windowsVirtualKeyCode,
      });
      await send("Input.dispatchKeyEvent", {
        type: "keyUp",
        key,
        code: key,
        windowsVirtualKeyCode,
      });
    };
    await wait(
      `!${controlsAreVisible}`,
      "Idle controls obscured a paused video",
    );
    await pressArrow("ArrowRight", 39);
    await atTime(10);
    await evaluate(`${seekForward}.focus()`);
    await pressArrow("ArrowLeft", 37);
    await atTime(0);
    await wait(
      `!${controlsAreVisible}`,
      "Focus kept the player controls visible indefinitely",
    );

    await evaluate(
      `${player}.scrollIntoView({ block: "center", behavior: "instant" })`,
    );
    const scrub = `${player}.querySelector('[aria-label="Vị trí phát video"]')`;
    const pointAt = (selector, ratio) =>
      evaluate(`(() => {
      const rect = ${selector}.getBoundingClientRect();
      return { x: rect.left + rect.width * ${ratio}, y: rect.top + rect.height / 2 };
    })()`);
    const moveMouse = async (selector, ratio) => {
      await send("Input.dispatchMouseEvent", {
        type: "mouseMoved",
        ...(await pointAt(selector, ratio)),
      });
    };
    const previewAt = (time) =>
      wait(
        `[...document.querySelectorAll('video')].slice(1).some(video =>
        video.classList.contains("opacity-100") && Math.abs(video.currentTime - ${time}) < 0.5)`,
        `Timeline did not preview the frame at ${time}s`,
      ).catch(async (error) => {
        const details =
          await evaluate(`[...document.querySelectorAll("video")].map(video => ({
          time: video.currentTime, duration: video.duration, ready: video.readyState,
          seeking: video.seeking, error: video.error?.message, className: video.className,
        }))`);
        throw new Error(`${error.message}: ${JSON.stringify(details)}`);
      });
    await moveMouse(player, 0.5);
    await wait(
      controlsAreVisible,
      "Pointer movement did not reveal the controls",
    );
    await moveMouse(scrub, 0.5);
    await previewAt(16);
    await moveMouse(scrub, 0.75);
    await previewAt(24);
    await atTime(0);
    await moveMouse(player, 0.5);
    await wait(
      'document.querySelectorAll("video").length === 1',
      "Preview video was not released on pointer leave",
    );

    await evaluate(
      `document.querySelector('button[aria-label="Phát"]').click()`,
    );
    await wait(`!${video}.paused`, "Video did not start");
    await wait(
      `!${controlsAreVisible}`,
      "Controls stayed visible during idle playback",
    );
    await evaluate(`(() => { ${video}.pause(); ${video}.currentTime = 0; })()`);

    await send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await send("Emulation.setTouchEmulationEnabled", { enabled: true });
    const tap = async (selector) => {
      const point = await evaluate(`(() => {
        const rect = ${selector}.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      })()`);
      await send("Input.dispatchTouchEvent", {
        type: "touchStart",
        touchPoints: [point],
      });
      await send("Input.dispatchTouchEvent", {
        type: "touchEnd",
        touchPoints: [],
      });
    };
    await evaluate(
      `${player}.scrollIntoView({ block: "center", behavior: "instant" })`,
    );
    await tap(player);
    await wait(controlsAreVisible, "Touch did not reveal hidden controls");
    await tap(seekForward);
    await atTime(10);
    await tap(seekBack);
    await atTime(0);
    await wait(
      `!${controlsAreVisible}`,
      "Mobile overlay stayed visible after seeking",
    );
    await tap(player);
    await wait(controlsAreVisible, "Touch did not reveal the timeline");
    await send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [await pointAt(scrub, 0.5)],
    });
    await previewAt(16);
    await atTime(0);
    await send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await atTime(16);
    await wait(
      'document.querySelectorAll("video").length === 1',
      "Touch preview stayed mounted after release",
    );

    await send("Emulation.clearDeviceMetricsOverride");
    await send("Emulation.setTouchEmulationEnabled", { enabled: false });
    await navigate(`${origin}/anime/1/watch?ep=1`);
    await ready();
    const fullscreenButton = `${player}.querySelector('button[aria-label="Toàn màn hình"]')`;
    await click(fullscreenButton);
    await wait(
      `document.fullscreenElement?.contains(${video}) === true`,
      "Player failed to enter fullscreen",
    );
    await evaluate(
      "void (window.fullscreenBeforeSwitch = document.fullscreenElement)",
    );
    const nextHint = button("Tập tiếp theo · Tập 2");
    assert.equal(await evaluate(`Boolean(${nextHint})`), false);
    await evaluate(`${video}.currentTime = ${video}.duration * 0.96`);
    await wait(
      `Boolean(${nextHint})`,
      "Next-episode shortcut did not appear near the end",
    );
    await click(nextHint);
    await wait(
      'document.fullscreenElement?.textContent.includes("Đang tìm nguồn phát cho tập 2") === true',
      "Next-episode loading was not shown in fullscreen",
    );
    await ready();
    await wait(
      `${player}.getAttribute("aria-label").startsWith("Tập 2") && !${video}.paused`,
      "The next episode did not start automatically",
    );
    assert.equal(
      await evaluate(
        "document.fullscreenElement === window.fullscreenBeforeSwitch",
      ),
      true,
    );
    await wait(
      `${video}.currentTime > 0.25`,
      "The new episode did not advance on its own",
    );
  });
  console.log("Player regression checks passed");
} finally {
  proxy.close();
  next.kill();
}
