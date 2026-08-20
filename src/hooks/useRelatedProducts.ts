import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

type RelatedProduct = {
  id: string;
  name: string;
  price?: number;
  img?: string;
  category: string;
  sold?: boolean;
};

export function useRelatedProducts(
  productId: string | undefined,
  category: string | undefined
) {
  return useQuery({
    queryKey: ["related_products", productId, category],
    enabled: !!productId && !!category,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, img, category, sold")
        .eq("category", category!)
        .neq("id", productId!)
        .eq("sold", false)
        .limit(8); // fetch 8, we'll shuffle client-side and show 4

      if (error) return [] as RelatedProduct[];

      // Fisher-Yates shuffle, return first 4
      const arr = [...(data ?? [])] as RelatedProduct[];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr.slice(0, 4);
    },
  });
}
