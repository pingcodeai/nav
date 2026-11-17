/**
 * 把体积偏大的位图图标压成 64px webp，并同步 manifest。
 * 图标渲染尺寸只有 20px 左右，原始大图纯属浪费带宽。
 * 用法：node scripts/optimize-icons.mjs
 */
import { execFileSync } from "node:child_process";
import { readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";

// sharp 装在 web/ 下，从仓库根运行脚本时需要指明解析位置
const sharp = createRequire(path.resolve(import.meta.dirname, "../web/package.json"))("sharp");

const ICON_DIR = path.resolve(import.meta.dirname, "../web/public/icons");
const MANIFEST = path.join(ICON_DIR, "manifest.json");
const THRESHOLD = 50 * 1024;
const SIZE = 64;

const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
const bySlug = new Map(Object.entries(manifest).map(([slug, file]) => [file, slug]));

function toWebp(input) {
  return sharp(input, { pages: 1 })
    .resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 82 })
    .toBuffer();
}

let saved = 0;
let count = 0;

for (const file of await readdir(ICON_DIR)) {
  if (/\.(svg|json|webp)$/i.test(file)) continue;

  const source = path.join(ICON_DIR, file);
  const { size } = await stat(source);
  if (size < THRESHOLD) continue;

  const slug = bySlug.get(file);
  if (!slug) {
    console.warn(`跳过 ${file}：manifest 里没有对应条目`);
    continue;
  }

  const target = `${slug}.webp`;
  let buffer;
  try {
    buffer = await toWebp(source);
  } catch {
    // sharp 不支持 ico，先借 sips 解成 png 再压
    const staging = path.join(tmpdir(), `${slug}.png`);
    try {
      execFileSync("sips", ["-s", "format", "png", source, "--out", staging], {
        stdio: "ignore"
      });
      buffer = await toWebp(staging);
      await unlink(staging);
    } catch {
      console.warn(`跳过 ${file}：无法解码该格式`);
      continue;
    }
  }

  await writeFile(path.join(ICON_DIR, target), buffer);
  if (target !== file) await unlink(source);

  manifest[slug] = target;
  saved += size - buffer.length;
  count += 1;
  console.log(`${file} ${(size / 1024).toFixed(0)}KB -> ${target} ${(buffer.length / 1024).toFixed(1)}KB`);
}

await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`\n转换 ${count} 个，省下 ${(saved / 1024).toFixed(0)}KB`);
