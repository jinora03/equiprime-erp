import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

/** Minimal browser storage for Zustand stores loaded during service tests. */
function createMemoryStorage() {
  const values = new Map();
  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    key(index) {
      return [...values.keys()][index] ?? null;
    },
    removeItem(key) {
      values.delete(key);
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
  };
}

Object.defineProperty(globalThis, "localStorage", {
  value: createMemoryStorage(),
  configurable: true,
});

const { createServer } = await import("vite");
const root = process.cwd();
const testsDir = path.join(root, "src", "tests", "core");
const files = (await fs.readdir(testsDir))
  .filter((file) => file.endsWith(".test.ts"))
  .sort();

const server = await createServer({
  configFile: path.join(root, "vite.config.ts"),
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error",
});

let passed = 0;
let failed = 0;
const startedAt = performance.now();

try {
  for (const file of files) {
    const absolutePath = path.join(testsDir, file);
    const modulePath = `/${path.relative(root, absolutePath).split(path.sep).join("/")}`;
    const loaded = await server.ssrLoadModule(modulePath);
    const tests = loaded.tests;
    if (!Array.isArray(tests)) {
      throw new Error(`${file} must export a tests array.`);
    }

    for (const test of tests) {
      try {
        await test.run();
        passed += 1;
        console.log(`✓ ${test.name}`);
      } catch (error) {
        failed += 1;
        console.error(`✗ ${test.name}`);
        console.error(error instanceof Error ? error.stack ?? error.message : error);
      }
    }
  }
} finally {
  await server.close();
}

const elapsed = Math.round(performance.now() - startedAt);
console.log(`\nCore frontend tests: ${passed} passed, ${failed} failed (${elapsed}ms)`);

if (failed > 0) process.exitCode = 1;
