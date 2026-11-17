import transformerDirectives from "@unocss/transformer-directives";
import { defineConfig, presetUno } from "unocss";

export default defineConfig({
  presets: [presetUno()],
  transformers: [transformerDirectives()],
  theme: {
    colors: {
      background: "rgb(var(--color-background) / <alpha-value>)",
      surface: "rgb(var(--color-surface) / <alpha-value>)",
      line: "rgb(var(--color-line) / <alpha-value>)",
      ink: "rgb(var(--color-ink) / <alpha-value>)",
      muted: "rgb(var(--color-muted) / <alpha-value>)",
      accent: "rgb(var(--color-accent) / <alpha-value>)",
  peach: "rgb(var(--color-peach) / <alpha-value>)",
      terracotta: "rgb(var(--color-terracotta) / <alpha-value>)",
      "active-bg": "rgb(var(--color-active-bg) / <alpha-value>)",
      "active-line": "rgb(var(--color-active-line) / <alpha-value>)",
      "hover-bg": "rgb(var(--color-hover-bg) / <alpha-value>)",
      "hover-line": "rgb(var(--color-hover-line) / <alpha-value>)",
      "header-bg": "rgb(var(--color-header-bg) / <alpha-value>)",
      panel: "rgb(var(--color-panel) / <alpha-value>)",
      "panel-line": "rgb(var(--color-panel-line) / <alpha-value>)",
      "field-bg": "rgb(var(--color-field-bg) / <alpha-value>)",
      "field-line": "rgb(var(--color-field-line) / <alpha-value>)"
    },
    fontFamily: {
      mono: "var(--font-mono)"
    }
  }
});
