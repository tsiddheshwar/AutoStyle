import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const srcRoot = path.join(projectRoot, "src");
const distRoot = path.join(projectRoot, "dist");

async function bundleCss(filePath, seen = new Set()) {
  const normalized = path.normalize(filePath);
  if (seen.has(normalized)) {
    return "";
  }

  seen.add(normalized);
  const source = await readFile(normalized, "utf8");
  const lines = source.split(/\r?\n/);
  const output = [];

  for (const line of lines) {
    const match = line.match(/^\s*@import\s+"(.+?)";\s*$/);
    if (match) {
      output.push((await bundleCss(path.resolve(path.dirname(normalized), match[1]), seen)).trimEnd());
      continue;
    }

    output.push(line);
  }

  return `${output.join("\n").trim()}\n`;
}

function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim();
}

async function main() {
  await mkdir(distRoot, { recursive: true });

  const css = await bundleCss(path.join(srcRoot, "autostyle.css"));
  await writeFile(path.join(distRoot, "autostyle.css"), css, "utf8");
  await writeFile(path.join(distRoot, "autostyle.min.css"), `${minifyCss(css)}\n`, "utf8");

  await copyFile(path.join(srcRoot, "theme.mjs"), path.join(distRoot, "theme.mjs"));
  await copyFile(path.join(srcRoot, "theme.iife.js"), path.join(distRoot, "theme.iife.js"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
