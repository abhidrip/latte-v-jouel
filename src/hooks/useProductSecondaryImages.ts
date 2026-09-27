import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

/**
 * useProductSecondaryImages
 *
 * Batch-fetches the second image (sort_order = 1) for all products.
 * Returns a Map<productId, imageUrl> for efficient lookup in the shop grid.
 * Used to show a crossfade hover effect on product cards.
 */
export function useProductSecondaryImages() {
  return useQuery({
    queryKey: ["product_secondary_images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_images")
        .select("product_id, url")
        .eq("sort_order", 1);

      if (error) {
        console.error("secondary images fetch error:", error);
        return new Map<string, string>();
      }

      const map = new Map<string, string>();
      for (const row of data ?? []) {
        // Only keep the first secondary image per product
        if (!map.has(row.product_id)) {
          map.set(row.product_id, row.url);
        }
      }
      return map;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
