import type { SitesData } from "@/types/site";

const empty: SitesData = {
  meta: { title: "", description: "", refTemplate: "", engines: [] },
  categories: [],
  sites: []
};

const data = ref<SitesData>(empty);
const loading = ref(true);

export function useSites() {
  if (loading.value && data.value.sites.length === 0) {
  fetch(`${import.meta.env.BASE_URL}sites.json`)
      .then(res => res.json())
      .then((json: SitesData) => {
        data.value = json;
      })
   .finally(() => {
    loading.value = false;
      });
  }

  /** 按分类顺序分组，空分类自动跳过 */
  const grouped = computed(() =>
  data.value.categories
      .map(category => ({
        category,
        sites: data.value.sites.filter(site => site.category === category.key)
      }))
    .filter(group => group.sites.length > 0)
  );

  /** 给外链拼接推广参数 */
  function resolveUrl(url: string) {
    const template = data.value.meta.refTemplate;
    if (!template) return url;
    return url + (url.includes("?") ? "&" : "?") + template;
  }

  return { data, loading, grouped, resolveUrl };
}
