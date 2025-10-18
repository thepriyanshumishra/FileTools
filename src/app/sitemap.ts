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

  const blogPosts = [
    'how-to-compress-pdf',
    'convert-jpg-to-png',
    'merge-pdf-files',
    'resize-images-bulk',
    'video-compression-guide',
    'pdf-security-tips',
  ].map(slug => ({
    url: `${baseUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    ...toolPages,
    ...blogPosts,
  ];
}
