import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// ── Dynamic Category Labels ──────────────────────────────────────────────────
// Maps raw category slug → display name. Add new categories here whenever
// a new slug is introduced in the admin app. The shop reads this map to
// build its filter tabs automatically.
export const CATEGORY_DISPLAY: Record<string, string> = {
  all:        'The Collection',
  rings:      'Rings',
  cuffs:      'Cuffs',
  bangles:    'Bangles',
  bracelets:  'Bracelets',
  pendants:   'Pendants',
  earrings:   'Earrings',
  necklaces:  'Necklaces',
  anklets:    'Anklets',
  sets:       'Sets',
};

export const CATEGORY_TAGLINE: Record<string, string> = {
  all:        'Each piece, a story.',
  rings:      'Sculpted circles, quiet devotion.',
  cuffs:      'For wrists that speak first.',
  bangles:    'Stacked, layered, eternal.',
  bracelets:  'Linked light. Endless line.',
  pendants:   'Worn close to the heart.',
  earrings:   'Whispers at the ear.',
  necklaces:  'Close to the collarbone.',
  anklets:    'Grounded in gold.',
  sets:       'Curated to wear together.',
};

// Returns a pretty label for any slug — falls back to capitalised slug
export function categoryLabel(slug: string): string {
  return CATEGORY_DISPLAY[slug] ?? (slug.charAt(0).toUpperCase() + slug.slice(1));
}

export function categoryTagline(slug: string): string {
  return CATEGORY_TAGLINE[slug] ?? 'Each piece, a story.';
}

// ── Hook: fetch distinct categories from the products table ──────────────────
// Returns ['all', ...sorted unique slugs from DB]. The shop uses this so any
// category added in the admin app appears automatically in the website filters.
export function useCategories() {
  return useQuery<string[]>({
    queryKey: ['categories'],
    initialData: ['all', 'earrings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('sold', false);
      if (error) {
        console.error('Error fetching categories:', error);
        return ['all'];
      }
      const unique = Array.from(
        new Set((data ?? []).map((r: { category: string }) => r.category).filter(Boolean))
      ).sort();
      return ['all', ...unique];
    },
    staleTime: 1000 * 60 * 10, // 10 min — categories rarely change
  });
}

