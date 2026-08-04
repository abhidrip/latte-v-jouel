import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export type Banner = {
  id: number;
  enabled: boolean;
  text: string;
  link: string;
  link_label: string;
};

export function useBanner() {
  return useQuery<Banner | null>({
    queryKey: ['banner'],
    queryFn: async () => {
      if (!supabase.supabaseUrl) return null;

      const { data, error } = await supabase
        .from('banner')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Error fetching banner:', error);
        return null;
      }

      return data as Banner;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
