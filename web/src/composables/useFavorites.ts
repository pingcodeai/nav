const STORE_KEY = "pingcode-nav-favorites";

/** 收藏的站点 slug 集合，模块级单例，全站共享同一份状态 */
const favorites = ref<string[]>(read());

function read(): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? "[]");
    return Array.isArray(saved) ? saved.filter(item => typeof item === "string") : [];
  } catch {
    // localStorage 不可用时降级为纯内存
    return [];
  }
}

watch(
  favorites,
  value => {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(value));
    } catch {
 // 写入失败不影响当前会话内的状态
    }
  },
  { deep: true }
);

export function useFavorites() {
  const favoriteSet = computed(() => new Set(favorites.value));

  function has(slug: string) {
    return favoriteSet.value.has(slug);
  }

  function toggle(slug: string) {
    const index = favorites.value.indexOf(slug);
    if (index === -1) favorites.value.push(slug);
    else favorites.value.splice(index, 1);
  }

  /** 剔除已从数据中移除的站点，避免计数虚高 */
  function prune(validSlugs: string[]) {
 const valid = new Set(validSlugs);
    const kept = favorites.value.filter(slug => valid.has(slug));
    if (kept.length !== favorites.value.length) favorites.value = kept;
  }

  return { favorites, favoriteSet, has, toggle, prune };
}
