import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DICTS, type Dict, type Lang } from "./dictionaries";

const Ctx = createContext<{ lang: Lang; t: Dict; setLang: (l: Lang) => void }>({ lang: "en", t: DICTS.en, setLang: () => {} });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  useEffect(() => {
    const s = localStorage.getItem("federai.lang") as Lang | null;
    if (s && s in DICTS) setLangState(s);
  }, []);
  useEffect(() => {
    document.documentElement.lang = lang === "rm" ? "en" : lang;
  }, [lang]);
  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("federai.lang", l);
  };
  return <Ctx.Provider value={{ lang, t: DICTS[lang], setLang }}>{children}</Ctx.Provider>;
}

export const useI18n = () => useContext(Ctx);
