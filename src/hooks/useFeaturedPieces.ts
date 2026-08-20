import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Reuses the existing products table — the admin app just toggles
// the `featured` boolean on any product to show it in the homepage slider.
export type FeaturedPiece = {
  id: string;
  name: string;        // products.name
  img: string | null;  // products.img
  price: number | null;
  link: string | null; // products.link (dm2buy URL)
  category: string;
};

export function useFeaturedPieces() {
  return useQuery<FeaturedPiece[]>({
    queryKey: ['featured_pieces'],
    queryFn: async () => {
      if (!supabase.supabaseUrl) return [];

      const { data, error } = await supabase
        .from('products')
        .select('id, name, img, price, link, category')
        .eq('featured', true)
        .eq('sold', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching featured products:', error);
        return [];
      }

      return (data ?? []) as FeaturedPiece[];
    },
    staleTime: 1000 * 60 * 5,
  });
}
