import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

async function assertExists(relativePath) {
  await access(path.join(projectRoot, relativePath));
}

async function main() {
  await assertExists("dist/autostyle.css");
  await assertExists("dist/autostyle.min.css");
  await assertExists("dist/theme.mjs");
  await assertExists("dist/theme.iife.js");

  const demoHtml = await readFile(path.join(projectRoot, "demo/index.html"), "utf8");
  if (!demoHtml.includes("../dist/autostyle.css")) {
    throw new Error("demo/index.html must use ../dist/autostyle.css");
  }

  if (!demoHtml.includes("../dist/theme.iife.js")) {
    throw new Error("demo/index.html must use ../dist/theme.iife.js");
  }

  console.log("Demo verification passed.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
