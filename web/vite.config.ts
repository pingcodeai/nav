import vue from "@vitejs/plugin-vue";
import { readFileSync } from "node:fs";
import { resolve } from "path";
import unoCss from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import { defineConfig } from "vite";
import {
  footerCopyright,
  footerEmail,
  footerGroups,
  footerSlogan,
  footerSocials
} from "./src/footer";

interface SeoData {
  meta: { description: string; refTemplate: string };
  categories: { key: string; name: string }[];
  sites: { name: string; url: string; category: string; description: string }[];
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char] ?? char);

function renderSeoContent() {
  const data = JSON.parse(readFileSync(resolve(__dirname, "../data/sites.json"), "utf8")) as SeoData;
  const groups = data.categories.map(category => ({
    ...category,
    sites: data.sites.filter(site => site.category === category.key)
  })).filter(group => group.sites.length > 0);

  const navigation = groups.map(group =>
    `<a href="#cat-${escapeHtml(group.key)}">${escapeHtml(group.name)}</a>`
  ).join("");
  const sections = groups.map(group => {
    const cards = group.sites.map(site => {
      let url: URL;
      try {
        url = new URL(site.url);
      } catch {
        return "";
      }
      if (url.protocol !== "https:" && url.protocol !== "http:") return "";
      if (data.meta.refTemplate) url.search += `${url.search ? "&" : "?"}${data.meta.refTemplate}`;
      return `<li><a href="${escapeHtml(url.href)}" target="_blank" rel="noopener noreferrer nofollow"><h3>${escapeHtml(site.name)}</h3><p>${escapeHtml(site.description)}</p></a></li>`;
    }).join("");
    return `<section id="cat-${escapeHtml(group.key)}"><h2>${escapeHtml(group.name)}</h2><ul>${cards}</ul></section>`;
  }).join("");

  return `<main class="seo-prerender wrap"><h1>AI工具导航</h1><p>${escapeHtml(data.meta.description)}</p><nav aria-label="站点分类">${navigation}</nav>${sections}</main>${renderSeoFooter()}`;
}

function renderSeoFooter() {
  const link = (href: string, label: string, extra = "") =>
    `<a href="${escapeHtml(href)}"${extra}>${escapeHtml(label)}</a>`;
  const external = ' target="_blank" rel="noopener"';
  const groups = footerGroups.map(group =>
    `<nav><h2>${escapeHtml(group.title)}</h2><ul>${group.links.map(item => `<li>${link(item.href, item.label, external)}</li>`).join("")}</ul></nav>`
  ).join("");
  const socials = footerSocials.map(item => link(item.href, item.label, external)).join("");

  return `<footer class="seo-prerender-footer wrap"><p>${escapeHtml(footerSlogan)}</p><p>需要帮助？${link(`mailto:${footerEmail}`, footerEmail)}</p><p>${socials}</p>${groups}<p>${escapeHtml(footerCopyright)}</p></footer>`;
}

export default defineConfig({
  base: "./",
  plugins: [
    vue(),
    unoCss(),
    {
      name: "seo-prerender",
      transformIndexHtml(html) {
        return html.replace('<div id="app"></div>', `<div id="app">${renderSeoContent()}</div>`);
      }
    },
    AutoImport({
      imports: ["vue"],
      dts: "./auto-imports.d.ts"
 })
  ],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src")
    }
  },
  server: {
    host: "0.0.0.0",
    port: 8891,
    open: true
  },
  build: {
    assetsDir: "nav_assets"
  }
});
