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
  await withChrome(async ({ navigate, evaluate }) => {
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
      await evaluate(`${video}.currentTime < 1`),
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
  });
  console.log("Player regression checks passed");
} finally {
  proxy.close();
  next.kill();
}
