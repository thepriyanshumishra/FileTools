import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog - File Conversion Tips & Tutorials | FileTools",
  description: "Learn how to convert, compress, and edit files with our comprehensive guides and tutorials. Expert tips for PDF, image, video, and document processing.",
};

const posts = [
  { slug: "how-to-compress-pdf", title: "How to Compress PDF Files Without Losing Quality", excerpt: "Learn the best techniques to reduce PDF file size while maintaining quality. Step-by-step guide with tips and tricks.", date: "2024-01-15", category: "PDF Tools" },
  { slug: "convert-jpg-to-png", title: "JPG vs PNG: When to Use Each Format", excerpt: "Understand the differences between JPG and PNG formats and learn when to use each for optimal results.", date: "2024-01-14", category: "Image Tools" },
  { slug: "merge-pdf-files", title: "5 Ways to Merge PDF Files Online for Free", excerpt: "Discover multiple methods to combine PDF documents quickly and easily without installing software.", date: "2024-01-13", category: "PDF Tools" },
  { slug: "resize-images-bulk", title: "Bulk Image Resizing: Complete Guide", excerpt: "Save time by resizing multiple images at once. Learn the best practices for batch image processing.", date: "2024-01-12", category: "Image Tools" },
  { slug: "video-compression-guide", title: "Video Compression Guide: Reduce File Size by 80%", excerpt: "Master video compression techniques to dramatically reduce file sizes while keeping quality high.", date: "2024-01-11", category: "Video Tools" },
  { slug: "pdf-security-tips", title: "How to Password Protect Your PDF Files", excerpt: "Secure your sensitive documents with password protection. Learn about PDF encryption and security best practices.", date: "2024-01-10", category: "PDF Tools" },
  { slug: "split-pdf-pages", title: "How to Split PDF into Separate Pages", excerpt: "Extract specific pages from PDF documents. Complete guide to splitting PDFs efficiently.", date: "2024-01-09", category: "PDF Tools" },
  { slug: "convert-png-to-jpg", title: "Convert PNG to JPG: Best Practices", excerpt: "Learn when and how to convert PNG images to JPG format for optimal file size and quality.", date: "2024-01-08", category: "Image Tools" },
  { slug: "rotate-pdf-pages", title: "Rotate PDF Pages: Quick Guide", excerpt: "Fix incorrectly oriented PDF pages. Learn how to rotate single or multiple pages easily.", date: "2024-01-07", category: "PDF Tools" },
  { slug: "image-format-guide", title: "Complete Image Format Guide: JPG, PNG, WebP, GIF", excerpt: "Understand all major image formats and choose the right one for your needs.", date: "2024-01-06", category: "Image Tools" },
  { slug: "pdf-to-word-conversion", title: "Convert PDF to Word: Maintain Formatting", excerpt: "Convert PDF documents to editable Word files while preserving layout and formatting.", date: "2024-01-05", category: "PDF Tools" },
  { slug: "compress-images-web", title: "Optimize Images for Web: Complete Guide", excerpt: "Reduce image file sizes for faster website loading. Best practices for web optimization.", date: "2024-01-04", category: "Image Tools" },
  { slug: "extract-pdf-pages", title: "Extract Pages from PDF Documents", excerpt: "Pull specific pages from large PDF files. Save time with selective extraction.", date: "2024-01-03", category: "PDF Tools" },
  { slug: "convert-heic-to-jpg", title: "Convert HEIC to JPG: iPhone Photos Guide", excerpt: "Convert iPhone HEIC photos to universal JPG format for better compatibility.", date: "2024-01-02", category: "Image Tools" },
  { slug: "pdf-watermark-guide", title: "Add Watermarks to PDF Files", excerpt: "Protect your PDFs with custom watermarks. Step-by-step watermarking guide.", date: "2024-01-01", category: "PDF Tools" },
  { slug: "crop-images-online", title: "Crop Images Online: Pro Tips", excerpt: "Master image cropping techniques for perfect compositions and aspect ratios.", date: "2023-12-31", category: "Image Tools" },
  { slug: "mp4-to-mp3-conversion", title: "Extract Audio from Video: MP4 to MP3", excerpt: "Convert video files to audio format. Extract soundtracks from your videos.", date: "2023-12-30", category: "Video Tools" },
  { slug: "pdf-page-numbers", title: "Add Page Numbers to PDF Documents", excerpt: "Insert custom page numbers into your PDF files. Professional document formatting.", date: "2023-12-29", category: "PDF Tools" },
  { slug: "resize-image-dimensions", title: "Resize Images: Pixels, Inches, and Aspect Ratios", excerpt: "Understanding image dimensions and how to resize for different purposes.", date: "2023-12-28", category: "Image Tools" },
  { slug: "merge-videos-online", title: "Combine Multiple Videos into One", excerpt: "Join video clips together seamlessly. Create compilations and montages.", date: "2023-12-27", category: "Video Tools" },
  { slug: "pdf-to-excel-conversion", title: "Convert PDF Tables to Excel Spreadsheets", excerpt: "Extract data from PDF tables into editable Excel format.", date: "2023-12-26", category: "PDF Tools" },
  { slug: "convert-webp-to-png", title: "WebP to PNG Conversion Guide", excerpt: "Convert modern WebP images to PNG for universal compatibility.", date: "2023-12-25", category: "Image Tools" },
  { slug: "trim-video-clips", title: "Cut and Trim Videos Online", excerpt: "Remove unwanted parts from videos. Precise video trimming guide.", date: "2023-12-24", category: "Video Tools" },
  { slug: "unlock-pdf-password", title: "Remove Password Protection from PDF", excerpt: "Unlock password-protected PDFs you own. Security removal guide.", date: "2023-12-23", category: "PDF Tools" },
  { slug: "image-background-removal", title: "Remove Image Backgrounds: Complete Guide", excerpt: "Create transparent backgrounds for product photos and graphics.", date: "2023-12-22", category: "Image Tools" },
  { slug: "video-to-gif-conversion", title: "Convert Video to GIF: Animated Images", excerpt: "Create GIF animations from video clips. Perfect for social media.", date: "2023-12-21", category: "Video Tools" },
  { slug: "organize-pdf-pages", title: "Reorder and Organize PDF Pages", excerpt: "Rearrange PDF pages in any order. Perfect document organization.", date: "2023-12-20", category: "PDF Tools" },
  { slug: "compress-png-images", title: "PNG Compression: Reduce File Size", excerpt: "Compress PNG images without losing transparency or quality.", date: "2023-12-19", category: "Image Tools" },
  { slug: "audio-format-conversion", title: "Convert Audio Files: MP3, WAV, OGG Guide", excerpt: "Convert between audio formats for compatibility and quality.", date: "2023-12-18", category: "Audio Tools" },
  { slug: "pdf-text-extraction", title: "Extract Text from PDF Documents", excerpt: "Copy text content from PDFs. OCR and text extraction guide.", date: "2023-12-17", category: "PDF Tools" },
  { slug: "flip-rotate-images", title: "Flip and Rotate Images: Quick Guide", excerpt: "Fix image orientation with flipping and rotation tools.", date: "2023-12-16", category: "Image Tools" },
  { slug: "video-speed-control", title: "Change Video Speed: Slow Motion and Fast Forward", excerpt: "Adjust video playback speed for creative effects.", date: "2023-12-15", category: "Video Tools" },
  { slug: "pdf-image-extraction", title: "Extract Images from PDF Files", excerpt: "Save all images from PDF documents as separate files.", date: "2023-12-14", category: "PDF Tools" },
  { slug: "convert-svg-to-png", title: "SVG to PNG Conversion: Vector to Raster", excerpt: "Convert scalable vector graphics to PNG images.", date: "2023-12-13", category: "Image Tools" },
  { slug: "compress-audio-files", title: "Reduce Audio File Size: Compression Guide", excerpt: "Compress audio files while maintaining sound quality.", date: "2023-12-12", category: "Audio Tools" },
  { slug: "pdf-form-filling", title: "Fill PDF Forms Online: Complete Guide", excerpt: "Fill out PDF forms digitally without printing.", date: "2023-12-11", category: "PDF Tools" },
];

export default function BlogPage() {
  return (
    <main className="container mx-auto px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">
          File Tools Blog
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Tips, tutorials, and guides for file conversion and processing
        </p>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="glass rounded-2xl p-6 hover:shadow-lg transition-all"
            >
              <div className="mb-3 flex items-center gap-2 text-sm">
                <span className="rounded-full bg-purple-100 px-3 py-1 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  {post.category}
                </span>
                <span className="text-zinc-500">{post.date}</span>
              </div>
              <h2 className="mb-2 text-xl font-bold">
                <Link
                  href={`/blog/${post.slug}`}
                  className="hover:text-purple-600 transition-colors"
                >
                  {post.title}
                </Link>
              </h2>
              <p className="mb-4 text-zinc-600 dark:text-zinc-400">
                {post.excerpt}
              </p>
              <Link
                href={`/blog/${post.slug}`}
                className="text-purple-600 font-semibold hover:underline"
              >
                Read More →
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
