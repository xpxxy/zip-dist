import en from "./locales/en.js";
import zhCN from "./locales/zh-CN.js";
import type { Lang } from "../types.js";

type Dict = typeof en;

const dictionaries: Record<Lang, Dict> = {
  en,
  "zh-CN": zhCN,
};

export function normalizeLang(input?: string): Lang | undefined {
  if (!input) return undefined;
  const value = input.toLowerCase();
  if (value === "en") return "en";
  if (value === "zh-cn" || value === "zh" || value === "cn") return "zh-CN";
  return undefined;
}

export function detectLang(env: NodeJS.ProcessEnv): Lang {
  const lang =
    `${env.LANG ?? ""}${env.LC_ALL ?? ""}${Intl.DateTimeFormat().resolvedOptions().locale ?? ""}`.toLowerCase();
  return lang.includes("zh") ? "zh-CN" : "en";
}

export function createI18n(lang: Lang) {
  const dict = dictionaries[lang];
  return {
    lang,
    t(key: string, vars?: Record<string, string | number>) {
      let template = (dict as Record<string, string>)[key] ?? key;
      if (!vars) return template;
      for (const [k, v] of Object.entries(vars)) {
        template = template.replaceAll(`{${k}}`, String(v));
      }
      return template;
    },
  };
}
