import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export type LuxuryPiece = {
  id: string;
  name: string;
  img: string | null;
  price: number | null;
  was: number | null;
  category: string;
  description: string | null;
  material: string | null;
};

/**
 * useLuxuryPieces
 *
 * Fetches products where `luxury = true` for the homepage Luxury section.
 * Similar pattern to useFeaturedPieces but with additional fields for
 * the editorial-style presentation.
 */
export function useLuxuryPieces() {
  return useQuery<LuxuryPiece[]>({
    queryKey: ['luxury_pieces'],
    queryFn: async () => {
      // First try fetching products with luxury=true
      const { data, error } = await supabase
        .from('products')
        .select('id, name, img, price, was, category, description, material')
        .eq('luxury', true)
        .eq('sold', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching luxury products:', error);
      }

      if (data && data.length > 0) {
        return data as LuxuryPiece[];
      }

      // Fallback: If no products have luxury=true yet, select top tier pieces by price
      const { data: topTier, error: topError } = await supabase
        .from('products')
        .select('id, name, img, price, was, category, description, material')
        .eq('sold', false)
        .order('price', { ascending: false })
        .limit(4);

      if (topError) {
        console.error('Error fetching fallback luxury products:', topError);
        return [];
      }

      return (topTier ?? []) as LuxuryPiece[];
    },
    staleTime: 1000 * 60 * 5,
  });
}
