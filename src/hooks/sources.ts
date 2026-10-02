import { useContext } from 'react';
import { SourceDrawerContext } from '@/components/SourceDrawer/SourceDrawerContext';

export function useOpenSource() {
  const open = useContext(SourceDrawerContext);
  if (!open) throw new Error('useOpenSource must be used inside SourceDrawerProvider');
  return open;
}
