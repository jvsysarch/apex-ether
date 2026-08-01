import {
  createContext,
  useContext,
  type PropsWithChildren,
} from 'react';
import type { ApexEtherLocale } from '@jvsysarch/apex-ether';

export type StudioText = (es: string, en: string) => string;

const StudioLocaleContext = createContext<ApexEtherLocale>('es');

export function StudioLocaleProvider({
  locale,
  children,
}: PropsWithChildren<{ readonly locale: ApexEtherLocale }>) {
  return <StudioLocaleContext.Provider value={locale}>{children}</StudioLocaleContext.Provider>;
}

export function useStudioLocale(): ApexEtherLocale {
  return useContext(StudioLocaleContext);
}

export function useStudioText(): StudioText {
  const locale = useStudioLocale();
  return (es, en) => locale === 'en' ? en : es;
}
