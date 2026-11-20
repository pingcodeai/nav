<script setup lang="ts">
import CategoryIcon from "@/components/CategoryIcon.vue";
import SiteCard from "@/components/SiteCard.vue";
import { useFavorites } from "@/composables/useFavorites";
import { useSites } from "@/composables/useSites";
import { useTheme } from "@/composables/useTheme";
import {
  footerCopyright,
  footerEmail,
  footerGroups,
  footerQrcodes,
  footerSlogan,
  footerSocials
} from "@/footer";
import { assetUrl } from "@/utils/icon";

const { data, loading, grouped, resolveUrl } = useSites();
const { favoriteSet, has, toggle, prune } = useFavorites();
const { isLight, toggleTheme } = useTheme();

/** 深色头部用白字版 logo，亮色头部用黑字版 */
const brandLogo = computed(() =>
  assetUrl(isLight.value ? "pingcode-logo-light.svg" : "pingcode-logo.svg")
);

const keyword = ref("");
const currentGroup = ref("");
const currentEngine = ref("google");

const searchInput = ref<HTMLInputElement>();

const motionReduced =
  typeof matchMedia === "function" ? matchMedia("(prefers-reduced-motion: reduce)") : null;

/** 数据到位后清掉已下架站点的收藏，并选中第一个分类 */
watch(
  () => data.value.sites,
  sites => {
    if (sites.length === 0) return;
    prune(sites.map(site => site.slug));
    if (!currentGroup.value) currentGroup.value = grouped.value[0]?.category.key ?? "";
  }
);

/** 搜索框只走外部引擎，列表不再被关键词过滤 */
const matchedGroups = computed(() =>
  grouped.value.map(group => ({
    category: group.category,
    sites: group.sites
  }))
);

/** 真正渲染的分区，空分区直接不渲染 */
const visibleGroups = computed(() => matchedGroups.value.filter(group => group.sites.length > 0));

/** 置顶的收藏区，按数据原顺序排列 */
const favoriteSites = computed(() =>
  data.value.sites.filter(site => favoriteSet.value.has(site.slug))
);

/** 侧边栏只管分类跳转 */
const filters = computed(() =>
  matchedGroups.value.map(group => ({
    key: group.category.key,
    name: group.category.name,
    icon: group.category.icon,
    disabled: group.sites.length === 0,
    active: group.category.key === currentGroup.value
  }))
);

/** AI 行业当下最热的三类，侧边栏名称前加火标 */
const hotKeys = new Set(["chat", "coding", "image"]);

/** 占位文案跟着当前引擎走 */
const searchPlaceholder = computed(() => {
  const engine = data.value.meta.engines.find(item => item.key === currentEngine.value);
  return engine ? `在 ${engine.name} 搜索` : "输入关键词";
});

const emptyText = "没有找到匹配的入口。试试其他分类。";

async function selectFilter(key: string) {
  currentGroup.value = key;
  await nextTick();

  const section = document.getElementById(`cat-${key}`);
  if (!section) return;
  section.querySelector("h2")?.focus({ preventScroll: true });
  section.scrollIntoView({
    behavior: motionReduced?.matches ? "instant" : "smooth",
    block: "start"
  });
}

function onSearchKeydown(event: KeyboardEvent) {
  if (event.key === "Enter") {
    submitSearch();
    return;
  }
  if (event.key !== "Escape") return;
  keyword.value = "";
}

/** 外部引擎：回车或点引擎按钮时新标签页打开 */
function submitSearch() {
  const engine = data.value.meta.engines.find(item => item.key === currentEngine.value);
  const query = keyword.value.trim();
  if (!query || !engine?.url) {
    searchInput.value?.focus({ preventScroll: true });
    return;
  }
  window.open(engine.url + encodeURIComponent(query), "_blank", "noopener");
}

const engineOpen = ref(false);
const enginePanel = ref<HTMLElement>();

const currentEngineName = computed(
  () => data.value.meta.engines.find(item => item.key === currentEngine.value)?.name ?? "引擎"
);

/** 点击面板外部时收起引擎列表 */
function onDocumentPointerDown(event: PointerEvent) {
  if (!engineOpen.value) return;
  const target = event.target as Node | null;
  if (target && enginePanel.value?.contains(target)) return;
  engineOpen.value = false;
}

onMounted(() => document.addEventListener("pointerdown", onDocumentPointerDown));
onUnmounted(() => document.removeEventListener("pointerdown", onDocumentPointerDown));

function selectEngine(key: string) {
  currentEngine.value = key;
  engineOpen.value = false;
  searchInput.value?.focus({ preventScroll: true });
}
</script>

<template>
  <header class="bg-background">
    <div class="wrap nav-bar flex items-center justify-between gap-4 min-h-[60px]">
      <a
        class="nav-brand flex flex-none items-center gap-2 no-underline"
 href="https://pingcode.ai/"
        target="_blank"
        rel="noopener"
        :aria-label="data.meta.title"
      >
        <img
   class="brand-mark"
   :src="brandLogo"
   alt="Pingcode.ai"
   width="403"
   height="100"
          decoding="async"
   />
      </a>

      <div class="flex flex-none items-center gap-2">
      <button
        type="button"
        class="grid h-[34px] w-[34px] flex-none place-items-center rounded-full border border-line bg-surface text-muted transition-colors duration-150 hover:border-hover-line hover:text-accent"
        :aria-label="isLight ? '切换到深色模式' : '切换到明亮模式'"
        :aria-pressed="isLight"
        @click="toggleTheme"
      >
        <svg
          v-if="isLight"
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
        <svg
          v-else
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.4v2.2M12 19.4v2.2M4.2 12H2M22 12h-2.2M6.5 6.5 4.9 4.9M19.1 19.1l-1.6-1.6M17.5 6.5l1.6-1.6M4.9 19.1l1.6-1.6" />
        </svg>
      </button>

      <a
        class="promo-pill relative inline-flex h-[34px] flex-none items-center gap-1.5 overflow-hidden rounded-full border border-active-line bg-active-bg px-[14px] text-[13px] font-600 text-peach no-underline transition-colors duration-150 hover:bg-accent/20 hover:text-accent"
        href="https://pingcode.ai/"
        target="_blank"
        rel="noopener"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M20 12v9H4v-9" />
          <path d="M2 7h20v5H2z" />
          <path d="M12 21V7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7Z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z" />
        </svg>
        免费领取千万 token
      </a>
      </div>
    </div>
  </header>

  <main>
    <section class="intro">
      <div class="wrap">
 <h1 class="m-0 mb-2 text-[clamp(32px,4vw,48px)] font-700 leading-[1.12] tracking-[-.04em] [grid-area:title]">
          <span>AI工具</span><span class="text-accent">导航</span>
        </h1>

 <p class="m-0 text-[clamp(16px,1.5vw,17px)] text-muted [grid-area:description]">
   {{ data.meta.description }}
        </p>

 <div
   class="search-control flex h-11 w-[min(100%,500px)] min-w-0 items-center rounded-full border border-field-line bg-field-bg transition-colors duration-300 focus-within:border-accent [grid-area:search]"
   role="search"
        >
          <div
            v-if="data.meta.engines.length > 0"
            ref="enginePanel"
            class="relative flex h-full flex-none items-center"
          >
            <button
              type="button"
              class="flex h-full items-center gap-1 pl-4 pr-2 text-[13px] font-600 text-ink"
              aria-label="搜索引擎"
              aria-haspopup="listbox"
              :aria-expanded="engineOpen"
              @click="engineOpen = !engineOpen"
            >
              {{ currentEngineName }}
              <svg
                class="text-ink/60 transition-transform duration-150"
                :class="{ 'rotate-180': engineOpen }"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            <ul
              v-show="engineOpen"
              class="absolute left-0 top-full z-20 m-0 mt-2 min-w-[160px] list-none rounded-xl border border-field-line bg-field-bg p-1 text-left shadow-xl"
              role="listbox"
            >
              <li v-for="engine in data.meta.engines" :key="engine.key">
                <button
                  type="button"
                  role="option"
                  class="flex w-full items-center justify-between gap-4 rounded-lg px-3 py-2 text-left text-[13px] transition-colors duration-150 hover:bg-ink/6"
                  :class="engine.key === currentEngine ? 'text-accent' : 'text-ink'"
                  :aria-selected="engine.key === currentEngine"
                  @click="selectEngine(engine.key)"
                >
                  {{ engine.name }}
                  <svg
                    v-if="engine.key === currentEngine"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m5 12.5 4.5 4.5L19 7" />
                  </svg>
                </button>
              </li>
            </ul>
            <span class="ml-1 h-5 w-px bg-field-line" aria-hidden="true" />
          </div>

          <input
     id="resource-search"
            ref="searchInput"
     v-model="keyword"
     type="search"
     class="h-full min-w-0 flex-1 border-0 bg-transparent p-0 pl-3 text-ink placeholder:text-ink/75 focus:outline-none"
     :placeholder="searchPlaceholder"
     autocomplete="off"
     @keydown="onSearchKeydown"
          />

          <button
     type="button"
     class="grid h-10 w-10 flex-none place-items-center rounded-full text-ink/75"
     aria-label="搜索"
     @click="submitSearch"
   >
     <svg
width="19"
height="19"
       viewBox="0 0 24 24"
       fill="none"
       stroke="currentColor"
       stroke-width="1.8"
       stroke-linecap="round"
aria-hidden="true"
            >
       <circle cx="10.8" cy="10.8" r="7.1" />
       <path d="m16 16 4.5 4.5" />
     </svg>
          </button>
    </div>
      </div>
    </section>

    <section class="wrap directory">
      <nav class="sticky top-5 flex flex-col gap-1 [grid-area:filters]" aria-label="站点分类">
 <button
          v-for="item in filters"
   :key="item.key"
   type="button"
   class="filter-button inline-flex items-center justify-start rounded-[5px] border border-transparent py-2 text-[14px] font-600 leading-[1.45] text-muted transition-colors duration-150 disabled:cursor-default disabled:opacity-45"
   :class="
     item.active
       ? 'border-active-line! bg-active-bg text-peach'
       : 'enabled:hover:bg-surface enabled:hover:text-ink'
   "
   :disabled="item.disabled"
          :aria-current="item.active ? 'location' : undefined"
          @click="selectFilter(item.key)"
        >
          <CategoryIcon :name="item.icon" class="text-current opacity-80" />
          <span class="inline-flex min-w-0 items-center gap-[4px]">
            <span class="truncate">{{ item.name }}</span>
            <svg
              v-if="hotKeys.has(item.key)"
              class="flex-none text-accent"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <title>热门</title>
              <path
                d="M13.4 2.3c-.4-.5-1.2-.3-1.4.3-.5 1.8-1.5 3.3-3 4.7C7 9.2 5.6 11.4 5.6 14c0 3.9 3.1 7 7 7s7-3.1 7-7c0-1.3-.3-2.5-.9-3.5-.3-.5-1-.5-1.3 0l-.6.9c-.3.4-1 .2-1-.4 0-3.3-.9-6.2-2.4-8.7Zm-.8 16.4c-1.4 0-2.5-.8-2.5-1.9 0-1.1.8-1.8 1.6-2.5.5-.4.9-.9 1.2-1.4.2-.4.8-.4 1 0 .7.9 1.2 1.8 1.2 2.9 0 1.6-1.1 2.9-2.5 2.9Z"
              />
            </svg>
          </span>
 </button>
      </nav>

      <div id="search-results" class="directory-results">
        <section
          v-if="favoriteSites.length"
          id="cat-favorites"
          class="scroll-mt-5"
          aria-labelledby="favorites-title"
        >
          <h2
            id="favorites-title"
            class="directory-heading flex items-center gap-2 border-b border-line font-650"
            tabindex="-1"
          >
            <CategoryIcon name="star" class="text-accent" />
            我的收藏
          </h2>

          <ul class="card-grid">
            <SiteCard
              v-for="site in favoriteSites"
              :key="site.slug"
              :site="site"
              :href="resolveUrl(site.url)"
              :favorite="true"
              @toggle="toggle"
            />
          </ul>
        </section>

 <section
          v-for="group in visibleGroups"
   :id="`cat-${group.category.key}`"
   :key="group.category.key"
          class="scroll-mt-5"
        >
   <h2 class="directory-heading border-b border-line font-650" tabindex="-1">
     {{ group.category.name }}
          </h2>

   <ul class="card-grid">
     <SiteCard
       v-for="site in group.sites"
       :key="site.slug"
       :site="site"
       :href="resolveUrl(site.url)"
:favorite="has(site.slug)"
       @toggle="toggle"
            />
          </ul>
 </section>

 <p
   v-if="!loading && visibleGroups.length === 0"
          class="m-0 rounded-lg border border-dashed border-line px-4 py-[30px] text-center text-muted"
        >
   {{ emptyText }}
 </p>
      </div>
    </section>
  </main>

  <footer class="site-footer border-t border-line">
    <div class="wrap">
      <div class="footer-top">
        <div class="footer-brand">
          <a href="https://pingcode.ai/" target="_blank" rel="noopener" aria-label="PingCode 首页">
            <img
              class="footer-logo"
              :src="brandLogo"
              alt="Pingcode.ai"
              width="403"
              height="100"
              loading="lazy"
              decoding="async"
            />
          </a>
          <p class="footer-slogan">{{ footerSlogan }}</p>
          <p class="footer-support">
            需要帮助？<a class="footer-mail" :href="`mailto:${footerEmail}`">{{ footerEmail }}</a>
          </p>
          <div class="footer-social">
            <a
              v-for="item in footerSocials"
              :key="item.label"
              class="footer-social-link"
              :href="item.href"
              target="_blank"
              rel="noopener"
              :aria-label="item.label"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path :d="item.path" />
              </svg>
            </a>
          </div>
        </div>

        <nav v-for="group in footerGroups" :key="group.title" class="footer-group">
          <h2 class="footer-group-title">{{ group.title }}</h2>
          <ul class="footer-list">
            <li v-for="link in group.links" :key="link.label">
              <a class="footer-link" :href="link.href" target="_blank" rel="noopener">{{ link.label }}</a>
            </li>
          </ul>
        </nav>

        <div class="footer-qrcodes">
          <figure v-for="qr in footerQrcodes" :key="qr.caption" class="footer-qr">
            <img
              class="footer-qr-img"
              :src="assetUrl(qr.src)"
              :alt="qr.alt"
              width="136"
              height="136"
              loading="lazy"
              decoding="async"
            />
            <figcaption class="footer-qr-caption">{{ qr.caption }}</figcaption>
          </figure>
        </div>
      </div>

      <div class="footer-bottom">
        <span>{{ footerCopyright }}</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.intro .wrap {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    "title"
    "description"
    "search";
  justify-items: center;
  align-items: center;
  text-align: center;
  padding-block: 32px 24px;
}

.search-control {
  margin-top: 16px;
}

.directory {
  display: grid;
  grid-template-columns: 156px minmax(0, 1fr);
  grid-template-areas: "filters results";
  align-items: start;
  column-gap: clamp(12px, 2.2vw, 28px);
  padding-bottom: 56px;
}

.directory-results {
  display: grid;
  grid-area: results;
  gap: 32px;
  min-width: 0;
}

.filter-button {
  gap: 8px;
  padding-inline: 12px;
}

.directory-heading {
  margin-bottom: 12px;
  padding-block: 4px 8px;
  font-size: 19px;
  line-height: 1.4;
}

/* 福利按钮的高光扫过效果 */
.promo-pill::after {
  content: "";
  position: absolute;
  inset-block: 0;
  width: 42%;
  background: linear-gradient(100deg, transparent, var(--promo-sweep), transparent);
  animation: promo-sweep 2.6s cubic-bezier(0.45, 0, 0.3, 1) infinite;
  pointer-events: none;
}

@keyframes promo-sweep {
  0% {
    left: -50%;
  }

  60%,
  100% {
    left: 120%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .promo-pill::after {
    animation: none;
    opacity: 0;
  }
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

@media (min-width: 1200px) {
  .card-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 930px) {
  .card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .intro .wrap {
    padding-block: 24px 20px;
  }

  .directory {
    grid-template-columns: 108px minmax(0, 1fr);
    column-gap: 12px;
    padding-bottom: 40px;
  }

  .filter-button {
    gap: 4px;
    padding-inline: 6px;
  }

  .card-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .directory-results {
    gap: 24px;
  }

  .directory-heading {
    margin-bottom: 10px;
    font-size: 18px;
  }
}

.nav-brand {
  color: rgb(var(--color-ink));
}

.brand-mark {
  width: auto;
  height: 30px;
  flex: none;
}

@media (max-width: 520px) {
  .nav-bar {
    gap: 8px;
    min-height: 56px;
  }

  .brand-mark {
    height: 24px;
  }

  .promo-pill {
    padding-inline: 9px;
    font-size: 12px;
    white-space: nowrap;
  }
}

@media (max-width: 360px) {
  .brand-mark {
    height: 22px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .search-control,
  #resource-search {
    transition: none;
  }
}

/* 页脚：结构与文案对齐 pingcode.ai 首页底部，配色沿用本站主题变量 */
.site-footer {
  padding: 48px 0 24px;
  background-color: rgb(var(--color-header-bg));
}

.footer-top {
  display: flex;
  flex-wrap: wrap;
  gap: 32px 48px;
  align-items: flex-start;
}

.footer-brand {
  flex: 1 1 300px;
  min-width: min(260px, 100%);
}

.footer-logo {
  width: auto;
  height: 32px;
}

.footer-slogan {
  margin-top: 16px;
  max-width: 360px;
  font-size: 14px;
  line-height: 1.7;
  color: rgb(var(--color-muted));
}

.footer-support {
  margin-top: 12px;
  font-size: 13px;
  color: rgb(var(--color-muted));
}

.footer-mail {
  color: rgb(var(--color-accent));
}

.footer-mail:hover {
  text-decoration: underline;
}

.footer-social {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.footer-social-link {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 1px solid rgb(var(--color-line));
  border-radius: 999px;
  color: rgb(var(--color-muted));
  background-color: rgb(var(--color-surface));
  transition: color 150ms, border-color 150ms;
}

.footer-social-link:hover {
  border-color: rgb(var(--color-hover-line));
  color: rgb(var(--color-accent));
}

.footer-group {
  flex: 0 0 auto;
  min-width: 108px;
}

.footer-group-title {
  font-size: 12px;
  font-weight: 650;
  letter-spacing: 0.04em;
  color: rgb(var(--color-accent));
}

.footer-list {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.footer-link {
  font-size: 13px;
  color: rgb(var(--color-muted));
  transition: color 150ms;
}

.footer-link:hover {
  color: rgb(var(--color-ink));
}

.footer-qrcodes {
  display: flex;
  flex: 0 0 auto;
  gap: 24px;
}

.footer-qr {
  text-align: center;
}

.footer-qr-img {
  width: 110px;
  height: 110px;
  border-radius: 8px;
  background-color: #fff;
}

.footer-qr-caption {
  margin-top: 10px;
  font-size: 12px;
  color: rgb(var(--color-muted));
}

.footer-bottom {
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px solid rgb(var(--color-line));
  font-size: 12px;
  color: rgb(var(--color-muted));
}

@media (max-width: 760px) {
  .site-footer {
    padding-top: 32px;
  }

  .footer-top {
    gap: 24px 28px;
  }

  .footer-qrcodes {
    gap: 18px;
  }

  .footer-qr-img {
    width: 92px;
    height: 92px;
  }
}
</style>
