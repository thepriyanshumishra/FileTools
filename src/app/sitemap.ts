import { MetadataRoute } from 'next';
import { fileCategories } from '@/lib/utils/file-types';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://filetools.vercel.app';
  
  const toolPages = fileCategories.flatMap(category =>
    category.types.map(type => ({
      url: `${baseUrl}/tools/${type.extension}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  );

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...toolPages,
  ];
}
