const STORE_KEY = "pingcode-nav-theme";

type Theme = "dark" | "light";

/** 首次访问跟随系统，之后以用户显式选择为准 */
function read(): Theme {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    // localStorage 不可用时降级为纯内存
  }
  return typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

/** 模块级单例，全站共享同一份主题状态 */
const theme = ref<Theme>(read());
let transitionInProgress = false;

watch(
  theme,
  value => {
    document.documentElement.dataset.theme = value;
    try {
      localStorage.setItem(STORE_KEY, value);
    } catch {
      // 写入失败不影响当前会话内的状态
    }
  },
  { immediate: true, flush: "sync" }
);

export function useTheme() {
  const isLight = computed(() => theme.value === "light");

  function toggleTheme() {
    if (transitionInProgress) return;
    const nextTheme = theme.value === "light" ? "dark" : "light";
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const viewTransitionDocument = document as Document & {
      startViewTransition?: (update: () => Promise<void>) => { finished: Promise<void> };
    };

    if (reducedMotion || !viewTransitionDocument.startViewTransition) {
      theme.value = nextTheme;
      return;
    }

    const root = document.documentElement;
    root.classList.add("theme-capture");
    transitionInProgress = true;
    const transition = viewTransitionDocument.startViewTransition(async () => {
      theme.value = nextTheme;
      await nextTick();
    });
    const finishTransition = () => {
      root.classList.remove("theme-capture");
      transitionInProgress = false;
    };
    void transition.finished.then(
      finishTransition,
      finishTransition
    );
  }

  return { theme, isLight, toggleTheme };
}
