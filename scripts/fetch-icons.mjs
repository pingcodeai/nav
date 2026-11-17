#!/usr/bin/env node
/**
 * 构建期抓取各站点 favicon 到 web/public/icons/。
 * 抓不到或抓到空白占位图的站点不生成文件，前端自动退回首字母色块。
 *
 * 用法：
 *   node scripts/fetch-icons.mjs          仅抓缺失的
 *   node scripts/fetch-icons.mjs --force  全部重抓
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const iconDir = resolve(root, "web/public/icons");
const force = process.argv.includes("--force");

/** 同一域名多个候选源，按顺序尝试 */
function sources(host) {
  return [
    `https://favicon.im/${host}?larger=true`,
    `https://www.google.com/s2/favicons?domain=${host}&sz=128`,
    `https://icon.horse/icon/${host}`,
    `https://${host}/favicon.ico`
  ];
}

/** favicon.im 等服务抓不到时会返回固定的占位图，按内容哈希拉黑 */
const placeholderHashes = new Set();

/** 判断是否为有效图标：体积够大、是已知图片格式、且不是纯单色 */
function validate(buffer) {
  if (buffer.length < 120) return false;

  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50;
  const isJpg = buffer[0] === 0xff && buffer[1] === 0xd8;
  const isGif = buffer[0] === 0x47 && buffer[1] === 0x49;
  const isIco = buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x01;
  const isWebp = buffer.subarray(8, 12).toString() === "WEBP";
  const isSvg = buffer.subarray(0, 400).toString().toLowerCase().includes("<svg");
  if (!(isPng || isJpg || isGif || isIco || isWebp || isSvg)) return false;

  // favicon.im 的空白占位图是极小的纯色 PNG，正常 logo 不会这么小
  if (isPng && buffer.length < 500) return false;

  return !placeholderHashes.has(createHash("sha1").update(buffer).digest("hex"));
}

function extOf(buffer) {
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return "png";
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return "jpg";
  if (buffer[0] === 0x47 && buffer[1] === 0x49) return "gif";
  if (buffer.subarray(8, 12).toString() === "WEBP") return "webp";
  if (buffer.subarray(0, 400).toString().toLowerCase().includes("<svg")) return "svg";
  return "ico";
}

async function tryFetch(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
  "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
        Accept: "image/avif,image/webp,image/png,image/svg+xml,image/*,*/*;q=0.8"
      }
  });
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    return validate(buffer) ? buffer : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** 先探测占位图指纹：拿一个必然抓不到图标的域名，把返回内容哈希记为黑名单 */
async function learnPlaceholder() {
  const probes = [
    "https://favicon.im/nonexistent-domain-zzz-probe.invalid?larger=true",
    "https://icon.horse/icon/nonexistent-domain-zzz-probe.invalid"
  ];
  for (const url of probes) {
    try {
   const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
   if (!res.ok) continue;
      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length > 0) {
        placeholderHashes.add(createHash("sha1").update(buffer).digest("hex"));
      }
    } catch {
      // 探测失败不影响主流程
    }
  }
}

async function main() {
  const data = JSON.parse(await readFile(resolve(root, "data/sites.json"), "utf8"));
  await mkdir(iconDir, { recursive: true });

  const existing = new Set(
    (await readdir(iconDir).catch(() => [])).filter(name => !name.startsWith("."))
  );

  if (force) {
    await Promise.all([...existing].map(name => unlink(resolve(iconDir, name))));
    existing.clear();
  }

  await learnPlaceholder();
  console.log(`已记录 ${placeholderHashes.size} 个占位图指纹`);

  const pending = data.sites.filter(
    site => ![...existing].some(name => name.startsWith(`${site.slug}.`))
  );
  console.log(`共 ${data.sites.length} 个站点，需抓取 ${pending.length} 个`);

  const ok = [];
  const failed = [];
  const concurrency = 8;

  for (let i = 0; i < pending.length; i += concurrency) {
    const batch = pending.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async site => {
        const host = new URL(site.url).hostname;
        for (const url of sources(host)) {
       const buffer = await tryFetch(url);
        if (buffer) {
            await writeFile(resolve(iconDir, `${site.slug}.${extOf(buffer)}`), buffer);
    ok.push(site.slug);
   return;
       }
    }
 failed.push(`${site.slug} (${host})`);
      })
    );
    console.log(`进度 ${Math.min(i + concurrency, pending.length)}/${pending.length}`);
  }

  console.log(`\n成功 ${ok.length} 个，失败 ${failed.length} 个`);
  if (failed.length) console.log(`以下站点将使用首字母色块：\n  ${failed.join("\n  ")}`);

  // 生成清单，供前端按 slug 查实际文件名（扩展名不固定）
  const files = (await readdir(iconDir)).filter(name => !name.startsWith(".") && name !== "manifest.json");
  const manifest = Object.fromEntries(
    files.map(name => [name.slice(0, name.lastIndexOf(".")), name]).sort(([a], [b]) => a.localeCompare(b))
  );
  await writeFile(resolve(iconDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`已写入 manifest.json（${Object.keys(manifest).length} 条）`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
