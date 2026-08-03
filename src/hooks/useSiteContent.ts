import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export type SiteContent = {
  hero_video_url?: string;
  hero_kicker?: string;
  hero_title_1?: string;
  hero_title_2?: string;
  hero_subtitle?: string;
  marquee_text?: string;
  showcase_1_kicker?: string;
  showcase_1_title?: string;
  showcase_1_desc?: string;
  showcase_2_kicker?: string;
  showcase_2_title?: string;
  showcase_2_desc?: string;
  showcase_3_kicker?: string;
  showcase_3_title?: string;
  showcase_3_desc?: string;
  about_image_url?: string;
  about_kicker?: string;
  about_title_1?: string;
  about_title_2?: string;
  about_desc?: string;
  about_tagline?: string;
  [key: string]: string | undefined;
};

export function useSiteContent() {
  return useQuery({
    queryKey: ['site_content'],
    queryFn: async () => {
      if (!supabase.supabaseUrl) return {} as SiteContent;
      
      const { data, error } = await supabase.from('site_content').select('*');
      
      if (error) {
        console.error("Error fetching site content:", error);
        return {} as SiteContent;
      }

      // Convert array of {key, value} to a single object
      const contentMap: SiteContent = {};
      data.forEach((item) => {
        contentMap[item.key] = item.value;
      });
      
      return contentMap;
    },
    // Keep the data fresh but don't refetch too aggressively
    staleTime: 1000 * 60 * 5, 
  });
}
