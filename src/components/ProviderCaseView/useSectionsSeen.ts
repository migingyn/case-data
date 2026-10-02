import { useEffect, useRef } from 'react';
import type { ProviderSection } from '@/types/shares';

/**
 * Calls onSeen once per section the first time at least half of it is on
 * screen. Returns a ref callback to attach to each section element. Pass a
 * stable callback (useCallback), or the observer restarts every render.
 */
export function useSectionsSeen(onSeen: ((section: ProviderSection) => void) | undefined) {
  const elements = useRef(new Map<ProviderSection, Element>());
  const seen = useRef(new Set<ProviderSection>());

  useEffect(() => {
    if (!onSeen || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const section = (entry.target as HTMLElement).dataset.section as ProviderSection;
          if (entry.isIntersecting && !seen.current.has(section)) {
            seen.current.add(section);
            onSeen(section);
          }
        }
      },
      { threshold: 0.5 },
    );
    elements.current.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [onSeen]);

  return (section: ProviderSection) => (element: Element | null) => {
    if (element) elements.current.set(section, element);
    else elements.current.delete(section);
  };
}
