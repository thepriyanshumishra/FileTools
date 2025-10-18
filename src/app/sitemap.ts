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
    'how-to-compress-pdf', 'convert-jpg-to-png', 'merge-pdf-files',
    'resize-images-bulk', 'video-compression-guide', 'pdf-security-tips',
    'split-pdf-pages', 'convert-png-to-jpg', 'rotate-pdf-pages',
    'image-format-guide', 'pdf-to-word-conversion', 'compress-images-web',
    'extract-pdf-pages', 'convert-heic-to-jpg', 'pdf-watermark-guide',
    'crop-images-online', 'mp4-to-mp3-conversion', 'pdf-page-numbers',
    'resize-image-dimensions', 'merge-videos-online', 'pdf-to-excel-conversion',
    'convert-webp-to-png', 'trim-video-clips', 'unlock-pdf-password',
    'image-background-removal', 'video-to-gif-conversion', 'organize-pdf-pages',
    'compress-png-images', 'audio-format-conversion', 'pdf-text-extraction',
    'flip-rotate-images', 'video-speed-control', 'pdf-image-extraction',
    'convert-svg-to-png', 'compress-audio-files', 'pdf-form-filling',
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
