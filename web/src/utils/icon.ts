import iconManifest from "../../public/icons/manifest.json";

const manifest = iconManifest as Record<string, string>;

/** 按 slug 取本地图标路径，没抓到的返回空（前端走首字母色块） */
export function iconPath(slug: string) {
  const file = manifest[slug];
  return file ? `${import.meta.env.BASE_URL}icons/${file}` : "";
}

/** 根据 slug 生成稳定的兜底底色，同一站点每次渲染颜色一致 */
export function fallbackColor(slug: string) {
  let hash = 0;
  for (const char of slug) {
    hash = (hash * 31 + char.charCodeAt(0)) % 360;
  }
  return `hsl(${hash}, 42%, 42%)`;
}

/** 配置里的图片路径补上站点根路径，站内相对路径不受部署目录影响 */
export function assetUrl(src: string) {
  if (!src) return "";
  if (/^(https?:|data:|\/)/.test(src)) return src;
  return `${import.meta.env.BASE_URL}${src.replace(/^\.\//, "")}`;
}
