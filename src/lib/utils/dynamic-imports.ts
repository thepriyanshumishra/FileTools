import dynamic from 'next/dynamic';

export const DynamicPDFTools = dynamic(() => import('./pdf-tools'), {
  ssr: false,
  loading: () => null,
});

export const DynamicVideoTools = dynamic(() => import('./video-tools'), {
  ssr: false,
  loading: () => null,
});

export const DynamicAudioTools = dynamic(() => import('./audio-tools'), {
  ssr: false,
  loading: () => null,
});

export const DynamicImageTools = dynamic(() => import('./image-tools'), {
  ssr: false,
  loading: () => null,
});

export const DynamicArchiveTools = dynamic(() => import('./archive-tools'), {
  ssr: false,
  loading: () => null,
});

export const DynamicDocumentTools = dynamic(() => import('./document-tools'), {
  ssr: false,
  loading: () => null,
});
