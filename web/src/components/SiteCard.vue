<script setup lang="ts">
import type { Site } from "@/types/site";
import { fallbackColor, iconPath } from "@/utils/icon";

const props = defineProps<{
  site: Site;
  href: string;
  favorite: boolean;
}>();

const emit = defineEmits<{ toggle: [slug: string] }>();

const failed = ref(false);

const icon = computed(() => iconPath(props.site.slug));
const color = computed(() => fallbackColor(props.site.slug));
const showImage = computed(() => Boolean(icon.value) && !failed.value);
</script>

<template>
  <li class="site-card-item">
    <div class="card-content">
      <a
        :href="href"
        target="_blank"
        rel="noopener noreferrer nofollow"
        class="card"
      >
        <!-- 白底板避免纯黑 logo 融进深色背景 -->
        <span
          v-if="showImage"
          class="card-icon card-icon--image"
        >
          <img
            :src="icon"
            :alt="site.name"
            class="card-icon-image"
            width="30"
            height="30"
            loading="lazy"
            decoding="async"
            @error="failed = true"
          />
        </span>
        <span
          v-else
          class="card-icon card-icon--fallback"
          :style="{ backgroundColor: color }"
        >
          {{ site.name.charAt(0) }}
        </span>

        <h3 class="card-title" :title="site.name">
          {{ site.name }}
        </h3>

        <p class="card-description" :title="site.description">
          {{ site.description }}
        </p>
      </a>

      <button
        type="button"
        class="card-favorite"
        :aria-pressed="favorite"
        :aria-label="`收藏「${site.name}」`"
        @click="emit('toggle', site.slug)"
      >
        <span aria-hidden="true">{{ favorite ? "★" : "☆" }}</span>
      </button>
    </div>
  </li>
</template>

<style scoped>
.site-card-item {
  min-width: 0;
  width: 100%;
}

.card-content {
  position: relative;
  width: 100%;
  height: 100%;
}

/* 卡片用 grid-template 固定「图标 | 文字」两列结构，描述与角标各占一行 */
.card {
  position: relative;
  display: grid;
  align-items: start;
  column-gap: 10px;
  row-gap: 4px;
  width: 100%;
  height: 100px;
  grid-template:
    "icon title" auto
    "icon description" minmax(0, 1fr)
    / 30px minmax(0, 1fr);
  padding: 12px;
  border: 1px solid rgb(var(--color-line));
  border-radius: 8px;
  background-color: rgb(var(--color-surface));
  transition: border-color 200ms, background-color 200ms;
}

.card:hover {
  border-color: rgb(var(--color-hover-line));
  background-color: rgb(var(--color-hover-bg));
}

.card-icon {
  grid-area: icon;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 5px;
}

.card-icon--image {
  overflow: hidden;
  background-color: white;
}

.card-icon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-icon--fallback {
  display: grid;
  place-items: center;
  color: rgb(255 255 255 / 95%);
  font-size: 13px;
  font-weight: 600;
}

.card-title,
.card-description {
  margin: 0;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
}

.card-title {
  grid-area: title;
  min-width: 0;
  padding-right: 25px;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  -webkit-line-clamp: 1;
}

.card-description {
  grid-area: description;
  align-self: start;
  color: rgb(var(--color-muted));
  font-size: 13px;
  line-height: 1.5;
  -webkit-line-clamp: 2;
}

.card-favorite {
  position: absolute;
  top: 8px;
  right: 7px;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 4px;
  color: rgb(var(--color-muted));
  background: transparent;
  font-size: 18px;
  line-height: 1;
  transition: color 150ms, background-color 150ms;
}

.card-favorite[aria-pressed="true"] {
  color: rgb(var(--color-accent));
}

.card-favorite:hover {
  background-color: rgb(var(--color-accent) / 15%);
}

@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  .card-content {
    transition: transform 200ms;
  }

  .site-card-item:hover .card-content {
    transform: translateY(-2px);
  }
}
</style>
