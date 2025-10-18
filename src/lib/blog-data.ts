export const blogPosts: Record<string, { title: string; content: string; date: string; category: string }> = {
  "split-pdf-pages": {
    title: "How to Split PDF into Separate Pages",
    date: "2024-01-09",
    category: "PDF Tools",
    content: `Split large PDF documents into individual pages or smaller sections for easier sharing and management.

## Why Split PDFs?
- Share specific pages without sending entire document
- Reduce file size for email attachments
- Organize documents by sections
- Extract important pages quickly

## Methods to Split PDFs
1. **By Page Range** - Extract pages 1-10, 11-20, etc.
2. **Individual Pages** - Separate every page
3. **By File Size** - Split into chunks under specific size
4. **Custom Ranges** - Select specific pages to extract

## Best Practices
- Keep original file as backup
- Use descriptive filenames for split files
- Verify page numbers before splitting
- Consider PDF bookmarks for navigation

Use FileTools to split PDFs instantly in your browser!`,
  },
  "convert-png-to-jpg": {
    title: "Convert PNG to JPG: Best Practices",
    date: "2024-01-08",
    category: "Image Tools",
    content: `Convert PNG images to JPG format to reduce file size while maintaining acceptable quality.

## When to Convert PNG to JPG
- Reduce file size for web use
- Email attachments with size limits
- Social media uploads
- Photo sharing platforms

## Quality Considerations
- JPG uses lossy compression
- Transparency will be lost
- Best for photographs
- Not ideal for text or graphics

## Conversion Settings
**High Quality**: 90-100% (larger files)
**Medium Quality**: 70-85% (balanced)
**Low Quality**: 50-65% (smallest files)

## Tips
- Start with high-quality PNG
- Test different quality levels
- Keep PNG original for editing
- Use JPG for final distribution

Convert PNG to JPG free with FileTools!`,
  },
  "rotate-pdf-pages": {
    title: "Rotate PDF Pages: Quick Guide",
    date: "2024-01-07",
    category: "PDF Tools",
    content: `Fix incorrectly oriented PDF pages by rotating them 90, 180, or 270 degrees.

## Common Rotation Needs
- Scanned documents in wrong orientation
- Mixed portrait and landscape pages
- Mobile-captured PDFs
- Imported images as PDFs

## Rotation Options
- **90° Clockwise** - Most common fix
- **90° Counter-clockwise** - Reverse rotation
- **180°** - Upside down correction
- **Batch Rotation** - All pages at once

## Best Practices
- Preview before saving
- Rotate individual pages if needed
- Check page numbers after rotation
- Save as new file to keep original

## Professional Tips
- Use consistent orientation
- Consider reading flow
- Check on multiple devices
- Verify before sharing

Rotate PDF pages instantly with FileTools!`,
  },
};

// Add remaining 27 posts with similar structure
export const additionalPosts = [
  "image-format-guide", "pdf-to-word-conversion", "compress-images-web",
  "extract-pdf-pages", "convert-heic-to-jpg", "pdf-watermark-guide",
  "crop-images-online", "mp4-to-mp3-conversion", "pdf-page-numbers",
  "resize-image-dimensions", "merge-videos-online", "pdf-to-excel-conversion",
  "convert-webp-to-png", "trim-video-clips", "unlock-pdf-password",
  "image-background-removal", "video-to-gif-conversion", "organize-pdf-pages",
  "compress-png-images", "audio-format-conversion", "pdf-text-extraction",
  "flip-rotate-images", "video-speed-control", "pdf-image-extraction",
  "convert-svg-to-png", "compress-audio-files", "pdf-form-filling"
];
