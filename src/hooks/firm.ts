import { useQuery } from '@tanstack/react-query';
import { getFirm } from '@/api/firm';

export const firmKeys = { all: ['firm'] as const };

export function useFirm() {
  return useQuery({ queryKey: firmKeys.all, queryFn: getFirm, staleTime: Number.POSITIVE_INFINITY });
}
