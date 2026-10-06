import { createContext, useContext, useEffect, useState } from 'react';

const LangContext = createContext({ lang: 'en', setLang: () => {} });
const KEY = 'glowback:lang';

function readLang() {
  try { return localStorage.getItem(KEY) === 'vi' ? 'vi' : 'en'; } catch { return 'en'; }
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(readLang);
  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem(KEY, lang); } catch { /* storage unavailable */ }
  }, [lang]);
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

// Pick the string for the current language from an { en, vi } dictionary.
export function useT(dict) {
  const { lang } = useLang();
  return dict[lang] || dict.en;
}
