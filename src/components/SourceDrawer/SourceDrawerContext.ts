import { createContext } from 'react';
import type { Source } from '@/types/sources';

/** Opens the Source drawer for an item. Null outside a SourceDrawerProvider. */
export const SourceDrawerContext = createContext<((source: Source) => void) | null>(null);
