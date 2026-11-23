<script setup lang="ts">
/** 分类图标：线性风格，按 categories[].icon 取对应路径 */
const props = defineProps<{ name: string; size?: number }>();

const paths: Record<string, string[]> = {
  code: ["m9 18-6-6 6-6", "m15 6 6 6-6 6"],
  "message-circle": [
    "M21 11.5a8.4 8.4 0 0 1-9 8.4 9.8 9.8 0 0 1-3.3-.5L3.5 21l1.3-4a8 8 0 0 1-1-3.8A8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z"
  ],
  workflow: ["M4 4h6v6H4z", "M14 14h6v6h-6z", "M10 7h4a3 3 0 0 1 3 3v4"],
  puzzle: ["M4 4h7v7H4z", "M13 4h7v7h-7z", "M4 13h7v7H4z", "M16.5 13v7", "M13 16.5h7"],
  layers: ["m12 3 9 5-9 5-9-5 9-5Z", "m3 13 9 5 9-5"],
  sparkles: [
    "m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z",
    "M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"
  ],
  search: ["M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z", "m16 16 4.5 4.5"],
  image: ["M4 4h16v16H4z", "M10 9.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z", "m20 15-5-5L6 19"],
  video: ["m22 8-6 4 6 4V8Z", "M3 6h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3z"],
  music: [
    "M9 18V5l12-2v13",
    "M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
    "M21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
  ],
  pen: ["M12 20h9", "M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"],
  briefcase: ["M3 7h18v13H3z", "M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"],
  palette: [
    "M12 21a9 9 0 1 1 9-9c0 2-1.6 3-3 3h-1.5a2 2 0 0 0-1 3.7A1.8 1.8 0 0 1 12 21Z",
    "M7.5 11.5h.01",
    "M10.5 8h.01",
    "M15 8.5h.01"
  ],
  "user-video": [
    "M3 5h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3z",
    "M9 11.5a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z",
    "M5.5 19a3.5 3.5 0 0 1 7 0",
    "m21 8-4 4 4 4V8Z"
  ],
  cube: ["m12 3 8 4.5v9L12 21l-8-4.5v-9z", "m4 7.5 8 4.5 8-4.5", "M12 12v9"],
  graduation: [
    "m12 4 10 5-10 5L2 9l10-5Z",
    "M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5",
    "M22 9v5"
  ],
  "shield-check": ["M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6z", "m9 12 2.2 2.2L15.5 10"],
  star: ["m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L3.1 9.8l6.5-.9z"],
  compass: ["M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z", "m14.8 9.2-2 5.6-5.6 2 2-5.6z"]
};

const shapes = computed(() => paths[props.name] ?? []);
</script>

<template>
  <svg
    class="flex-none"
    :width="size ?? 15"
    :height="size ?? 15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path v-for="(d, index) in shapes" :key="index" :d="d" />
  </svg>
</template>
