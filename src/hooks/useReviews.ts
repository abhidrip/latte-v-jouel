import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export type Review = {
  id: string;
  customer_name: string;
  screenshot_url: string;
  display_order: number;
  visible: boolean;
};

export function useReviews() {
  return useQuery<Review[]>({
    queryKey: ['reviews'],
    queryFn: async () => {
      if (!supabase.supabaseUrl) return [];

      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('visible', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching reviews:', error);
        return [];
      }

      return (data ?? []) as Review[];
    },
    staleTime: 1000 * 60 * 5,
  });
}
