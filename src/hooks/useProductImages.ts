import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export type ProductImage = {
  id: string;
  product_id: string;
  url: string;
  alt?: string;
  sort_order: number;
};

export function useProductImages(productId: string | undefined) {
  return useQuery({
    queryKey: ["product_images", productId],
    enabled: !!productId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId!)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("product_images fetch error:", error);
        return [] as ProductImage[];
      }
      return (data ?? []) as ProductImage[];
    },
  });
}
