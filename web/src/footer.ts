/** 页脚内容对齐 pingcode.ai 首页底部；App.vue 渲染和 vite 预渲染共用这一份 */
export const footerSlogan = "一个 API，连接 Claude、GPT、Gemini 等模型。轻松上手，让想法加速落地";
export const footerEmail = "support@pingcode.ai";
export const footerCopyright = "© pingcode.ai 为开发者而建";

export const footerSocials = [
  {
    label: "PingCode AI 的 X 主页",
    href: "https://x.com/pingcode_ai?s=20",
    path: "M18.9 2.3h3.4l-7.4 8.5L23 21.7h-6.8l-5.3-7-6.1 7H1.4l7.9-9L1 2.3h7l4.9 6.5 6-6.5Zm-1.2 17.3h1.9L6.4 4.3H4.4l13.3 15.3Z"
  },
  {
    label: "PingCode AI 的 Telegram 联系方式",
    href: "https://web.telegram.org/a/#8855886329",
    path: "M21.9 4.3 18.9 19c-.2 1-.8 1.3-1.7.8l-4.6-3.4-2.2 2.1c-.3.3-.5.5-1 .5l.4-5 9-8.1c.4-.3-.1-.5-.6-.2L7.1 13l-4.8-1.5c-1-.3-1-1 .2-1.5l18-6.9c.9-.3 1.6.2 1.4 1.2Z"
  }
];

export const footerGroups = [
  {
    title: "相关链接",
    links: [
      { label: "模型价格", href: "https://pingcode.ai/pricing" },
      { label: "文档", href: "https://pingcode.ai/docs" },
      { label: "服务条款", href: "https://pingcode.ai/terms" },
      { label: "隐私政策", href: "https://pingcode.ai/privacy" }
    ]
  },
  {
    title: "接入指南",
    links: [
      { label: "Quick Start", href: "https://pingcode.ai/docs/quick-start" },
      { label: "Claude", href: "https://pingcode.ai/docs/claude-cli" },
      { label: "Codex", href: "https://pingcode.ai/docs/codex-cli" }
    ]
  }
];

export const footerQrcodes = [
  { src: "qr-support.png", alt: "专属客服二维码", caption: "微信扫码，联系客服" },
  { src: "qr-official-account.jpg", alt: "微信公众号二维码", caption: "微信扫码，关注公众号" }
];
