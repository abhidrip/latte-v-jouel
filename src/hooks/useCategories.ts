import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// ── Dynamic Category Labels ──────────────────────────────────────────────────
// Maps raw category slug → display name. Add new categories here whenever
// a new slug is introduced in the admin app. The shop reads this map to
// build its filter tabs automatically.
export const CATEGORY_DISPLAY: Record<string, string> = {
  all:        'The Collection',
  rings:      'Rings',
  ring:       'Rings',
  cuffs:      'Cuffs',
  cuff:       'Cuffs',
  bangles:    'Bangles',
  bangle:     'Bangles',
  bracelets:  'Bracelets',
  bracelet:   'Bracelets',
  pendants:   'Pendants',
  pendant:    'Pendants',
  earrings:   'Earrings',
  earring:    'Earrings',
  necklaces:  'Necklaces',
  necklace:   'Necklaces',
  anklets:    'Anklets',
  anklet:     'Anklets',
  sets:       'Sets',
  set:        'Sets',
};

export const CATEGORY_TAGLINE: Record<string, string> = {
  all:        'Each piece, a story.',
  rings:      'Sculpted circles, quiet devotion.',
  ring:       'Sculpted circles, quiet devotion.',
  cuffs:      'For wrists that speak first.',
  cuff:       'For wrists that speak first.',
  bangles:    'Stacked, layered, eternal.',
  bangle:     'Stacked, layered, eternal.',
  bracelets:  'Linked light. Endless line.',
  bracelet:   'Linked light. Endless line.',
  pendants:   'Worn close to the heart.',
  pendant:    'Worn close to the heart.',
  earrings:   'Whispers at the ear.',
  earring:    'Whispers at the ear.',
  necklaces:  'Close to the collarbone.',
  necklace:   'Close to the collarbone.',
  anklets:    'Grounded in gold.',
  anklet:     'Grounded in gold.',
  sets:       'Curated to wear together.',
  set:        'Curated to wear together.',
};

// Returns a pretty label for any slug — falls back to capitalised slug
export function categoryLabel(slug: string): string {
  const normalized = (slug || '').toLowerCase().trim();
  return CATEGORY_DISPLAY[normalized] ?? (slug.charAt(0).toUpperCase() + slug.slice(1));
}

export function categoryTagline(slug: string): string {
  const normalized = (slug || '').toLowerCase().trim();
  return CATEGORY_TAGLINE[normalized] ?? 'Each piece, a story.';
}

// ── Hook: fetch distinct categories from the products table ──────────────────
// Returns ['all', ...sorted unique slugs from DB]. The shop uses this so any
// category added in the admin app appears automatically in the website filters.
export function useCategories() {
  return useQuery<string[]>({
    queryKey: ['categories'],
    initialData: ['all', 'earrings'],
    initialDataUpdatedAt: 0, // Treats initialData as stale so it revalidates from Supabase on mount
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('sold', false);
      if (error) {
        console.error('Error fetching categories:', error);
        return ['all', 'earrings'];
      }
      const unique = Array.from(
        new Set((data ?? []).map((r: { category: string }) => (r.category || '').toLowerCase().trim()).filter(Boolean))
      ).sort();
      return ['all', ...unique];
    },
    staleTime: 1000 * 30, // 30s — fast update when admin app uploads new items
    refetchOnMount: true,
  });
}

