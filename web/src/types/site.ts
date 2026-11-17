export type Region = "overseas" | "china";

export interface Category {
  key: string;
  name: string;
  icon: string;
}

/** 搜索框下方的引擎切换项，key 为 "site" 时走站内过滤 */
export interface SearchEngine {
  key: string;
  name: string;
  /** 站内项留空；其余为搜索地址前缀，关键词直接拼在后面 */
  url: string;
}

export interface Site {
  slug: string;
  name: string;
  url: string;
  category: string;
  description: string;
  region: Region;
  /** 是否支持填自定义 API 地址 / 可对接中转服务 */
  apiReady: boolean;
  /** 只参与站内搜索命中，不在卡片上展示 */
  tags: string[];
}

export interface SitesData {
  meta: {
    title: string;
    description: string;
    /** 外链推广参数模板，如 "utm_source=pingcode"，留空则不拼接 */
    refTemplate: string;
    engines: SearchEngine[];
  };
  categories: Category[];
  sites: Site[];
}

/** 侧边栏筛选项：真实分类，或「已收藏」这个虚拟项 */
export interface FilterItem {
  key: string;
  name: string;
  icon: string;
  count: number;
  disabled: boolean;
  active: boolean;
}
