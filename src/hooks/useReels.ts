import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export type Reel = {
  id: string;
  title: string;
  video_url: string;
  instagram_url: string;
  display_order: number;
  visible: boolean;
};

export function useReels() {
  return useQuery<Reel[]>({
    queryKey: ['reels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reels')
        .select('*')
        .eq('visible', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching reels:', error);
        return [];
      }

      return (data ?? []) as Reel[];
    },
    staleTime: 1000 * 60 * 5,
  });
}
