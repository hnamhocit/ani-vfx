import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

export async function until(check, message) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    const result = await check().catch(() => false);
    if (result) return result;
    await sleep(100);
  }
  throw new Error(message);
}

export async function withChrome(test) {
  const profile = await mkdtemp(join(tmpdir(), "anivfx-chrome-"));
  const chrome = spawn(
    process.env.CHROME_BIN || "google-chrome",
    [
      "--headless",
      "--disable-dev-shm-usage",
      "--disable-extensions",
      "--no-sandbox",
      "--autoplay-policy=no-user-gesture-required",
      "--remote-debugging-port=0",
      `--user-data-dir=${profile}`,
      "about:blank",
    ],
    { stdio: "ignore" },
  );
  const finished = new Promise((resolve) => {
    chrome.once("exit", resolve);
    chrome.once("error", resolve);
  });
  try {
    const endpoint = await until(async () => {
      const [port] = (
        await readFile(join(profile, "DevToolsActivePort"), "utf8")
      ).split("\n");
      const tabs = await (
        await fetch(`http://127.0.0.1:${port}/json/list`)
      ).json();
      return tabs.find(
        (tab) => tab.type === "page" && tab.url === "about:blank",
      )?.webSocketDebuggerUrl;
    }, "Chrome did not start");
    const socket = new WebSocket(endpoint);
    await new Promise((resolve, reject) => {
      socket.addEventListener("open", resolve, { once: true });
      socket.addEventListener("error", reject, { once: true });
    });
    let sequence = 0;
    const send = (method, params) =>
      new Promise((resolve, reject) => {
        const id = ++sequence;
        const onMessage = ({ data }) => {
          const reply = JSON.parse(data);
          if (reply.id !== id) return;
          socket.removeEventListener("message", onMessage);
          if (reply.error) reject(new Error(reply.error.message));
          else resolve(reply.result);
        };
        socket.addEventListener("message", onMessage);
        socket.send(JSON.stringify({ id, method, params }));
      });
    try {
      await test({
        send,
        navigate: (url) => send("Page.navigate", { url }),
        evaluate: async (expression) => {
          const { result, exceptionDetails } = await send("Runtime.evaluate", {
            expression,
            returnByValue: true,
            awaitPromise: true,
            userGesture: true,
          });
          if (exceptionDetails)
            throw new Error(
              exceptionDetails.exception?.description || exceptionDetails.text,
            );
          return result.value;
        },
      });
    } finally {
      socket.close();
    }
  } finally {
    chrome.kill();
    await finished;
    await rm(profile, { recursive: true, force: true, maxRetries: 3 });
  }
}
