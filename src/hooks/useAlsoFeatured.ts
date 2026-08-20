import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export type AlsoFeaturedItem = {
  id: string;
  photo_url: string;
  person_name: string;
  description: string;
  product_name: string;
  product_img: string;
  product_link: string;  // kept for DB compat but not used for navigation
  product_id: string | null; // UUID of the product in our products table
  product_price: number | null;
  display_order: number;
  visible: boolean;
};

export function useAlsoFeatured() {
  return useQuery<AlsoFeaturedItem[]>({
    queryKey: ['also_featured'],
    queryFn: async () => {
      if (!supabase.supabaseUrl) return [];

      const { data, error } = await supabase
        .from('also_featured')
        .select('*')
        .eq('visible', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching also_featured:', error);
        return [];
      }

      return (data ?? []) as AlsoFeaturedItem[];
    },
    staleTime: 1000 * 60 * 5,
  });
}
