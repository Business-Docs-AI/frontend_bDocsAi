import { useEffect, useState } from 'react';

/**
 * Substituto do `useMediaQuery` do MUI usado durante a migracao para Tailwind.
 * Mesmo contrato: recebe uma media query e devolve se ela casa agora,
 * reavaliando quando o viewport muda.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    function handleChange(event: MediaQueryListEvent) {
      setMatches(event.matches);
    }

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}
