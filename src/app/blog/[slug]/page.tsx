import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/blog-data";
import { sanitizeText } from "@/lib/utils/sanitize";

const fallbackPosts: Record<string, { title: string; content: string; date: string; category: string }> = {
  "how-to-compress-pdf": {
    title: "How to Compress PDF Files Without Losing Quality",
    date: "2024-01-15",
    category: "PDF Tools",
    content: `
# How to Compress PDF Files Without Losing Quality

PDF files can quickly become large, especially when they contain high-resolution images or scanned documents. Here's how to compress them effectively.

## Why Compress PDFs?

- **Email attachments**: Most email services limit attachment sizes to 25MB
- **Faster uploads**: Smaller files upload and download faster
- **Storage savings**: Reduce cloud storage costs
- **Better performance**: Smaller PDFs load faster in browsers

## Best Compression Methods

### 1. Use Online Tools
FileTools offers free PDF compression that maintains quality while reducing file size by up to 90%.

### 2. Optimize Images
Images are usually the largest component of PDFs. Compress images before adding them to PDFs.

### 3. Remove Unnecessary Elements
- Delete unused pages
- Remove embedded fonts
- Strip metadata

## Tips for Best Results

- Start with high-quality source files
- Use lossless compression when possible
- Test different compression levels
- Keep backups of original files

## Conclusion

With the right tools and techniques, you can significantly reduce PDF file sizes without sacrificing quality. Try our free PDF compression tool today!
    `,
  },
  "convert-jpg-to-png": {
    title: "JPG vs PNG: When to Use Each Format",
    date: "2024-01-14",
    category: "Image Tools",
    content: `
# JPG vs PNG: When to Use Each Format

Understanding the difference between JPG and PNG formats helps you choose the right format for your needs.

## JPG (JPEG) Format

**Best for:**
- Photographs
- Complex images with many colors
- Web images where file size matters

**Pros:**
- Smaller file sizes
- Widely supported
- Good for photos

**Cons:**
- Lossy compression
- No transparency support
- Quality degrades with each save

## PNG Format

**Best for:**
- Graphics with text
- Images requiring transparency
- Screenshots
- Logos and icons

**Pros:**
- Lossless compression
- Supports transparency
- Better for text and sharp edges

**Cons:**
- Larger file sizes
- Not ideal for photos

## When to Convert

**JPG to PNG:**
- Need transparency
- Require lossless quality
- Working with graphics/text

**PNG to JPG:**
- Reduce file size
- Sharing photos online
- Email attachments

Use FileTools to convert between formats instantly in your browser!
    `,
  },
  "merge-pdf-files": {
    title: "5 Ways to Merge PDF Files Online for Free",
    date: "2024-01-13",
    category: "PDF Tools",
    content: `
# 5 Ways to Merge PDF Files Online for Free

Combining multiple PDF files into one document is a common task. Here are the best free methods.

## Method 1: FileTools PDF Merger

Our free online tool lets you:
- Drag and drop PDFs to reorder
- Merge unlimited files
- No file size limits
- 100% browser-based (no upload)

## Method 2: Organize Before Merging

**Pro tips:**
- Rename files with numbers (01, 02, 03)
- Review each PDF before merging
- Remove unnecessary pages first
- Check file sizes

## Method 3: Batch Processing

Merge multiple PDFs at once:
1. Select all files
2. Arrange in desired order
3. Click merge
4. Download combined PDF

## Common Use Cases

- **Business**: Combine invoices, reports
- **Education**: Merge lecture notes, assignments
- **Personal**: Combine scanned documents
- **Legal**: Merge contracts, agreements

## Best Practices

- Keep original files as backup
- Use descriptive filenames
- Compress after merging if needed
- Test the merged PDF

Start merging PDFs for free with FileTools today!
    `,
  },
  "resize-images-bulk": {
    title: "Bulk Image Resizing: Complete Guide",
    date: "2024-01-12",
    category: "Image Tools",
    content: `
# Bulk Image Resizing: Complete Guide

Resize multiple images at once to save time and maintain consistency.

## Why Bulk Resize?

- **Web optimization**: Faster page loads
- **Social media**: Consistent dimensions
- **Email**: Reduce attachment sizes
- **Storage**: Save disk space

## Common Resize Scenarios

### 1. Website Images
- Thumbnails: 150x150px
- Blog images: 800x600px
- Hero images: 1920x1080px

### 2. Social Media
- Instagram: 1080x1080px
- Facebook: 1200x630px
- Twitter: 1200x675px

### 3. Email Attachments
- Max width: 600-800px
- Compress for smaller size

## How to Bulk Resize

1. Select all images
2. Choose target dimensions
3. Maintain aspect ratio
4. Process all at once
5. Download as ZIP

## Pro Tips

- Always keep originals
- Use consistent naming
- Test one image first
- Consider file format

FileTools makes bulk resizing simple and fast!
    `,
  },
  "video-compression-guide": {
    title: "Video Compression Guide: Reduce File Size by 80%",
    date: "2024-01-11",
    category: "Video Tools",
    content: `
# Video Compression Guide: Reduce File Size by 80%

Learn how to compress videos dramatically while maintaining quality.

## Why Compress Videos?

- **Faster uploads**: Share videos quickly
- **Storage savings**: Free up disk space
- **Streaming**: Better playback performance
- **Mobile-friendly**: Smaller downloads

## Compression Techniques

### 1. Reduce Resolution
- 4K → 1080p: 75% smaller
- 1080p → 720p: 50% smaller
- 720p → 480p: 60% smaller

### 2. Lower Bitrate
- High: 8-12 Mbps
- Medium: 4-6 Mbps
- Low: 1-2 Mbps

### 3. Change Format
- MP4: Best compatibility
- WebM: Smaller sizes
- AVI: Larger but compatible

## Best Settings

**For Web:**
- Format: MP4
- Resolution: 1080p
- Bitrate: 4-6 Mbps

**For Mobile:**
- Format: MP4
- Resolution: 720p
- Bitrate: 2-4 Mbps

## Tools & Tips

- Use FileTools for instant compression
- Test different settings
- Keep original files
- Check quality after compression

Compress your videos now with FileTools!
    `,
  },
  "pdf-security-tips": {
    title: "How to Password Protect Your PDF Files",
    date: "2024-01-10",
    category: "PDF Tools",
    content: `
# How to Password Protect Your PDF Files

Secure your sensitive documents with password protection and encryption.

## Why Protect PDFs?

- **Confidential documents**: Contracts, agreements
- **Financial records**: Bank statements, invoices
- **Personal information**: IDs, certificates
- **Business data**: Reports, proposals

## Types of Protection

### 1. Open Password
Requires password to open the PDF

### 2. Permissions Password
Restricts editing, printing, copying

### 3. Encryption
256-bit AES encryption for maximum security

## How to Add Password

1. Upload your PDF
2. Choose protection type
3. Set strong password
4. Download protected PDF

## Password Best Practices

- Use 12+ characters
- Mix letters, numbers, symbols
- Avoid common words
- Don't share passwords via email
- Use password manager

## Additional Security

- Remove metadata
- Redact sensitive information
- Use digital signatures
- Set expiration dates

## When to Use

**Always protect:**
- Tax documents
- Legal contracts
- Medical records
- Financial statements

**Consider protecting:**
- Business proposals
- Personal documents
- Shared files

Protect your PDFs now with FileTools!
    `,
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = blogPosts[params.slug] || fallbackPosts[params.slug];
  
  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: `${post.title} | FileTools Blog`,
    description: post.content.substring(0, 160),
  };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = blogPosts[params.slug] || fallbackPosts[params.slug] || {
    title: "File Processing Guide",
    date: "2024-01-01",
    category: "Tools",
    content: `Learn how to process files efficiently with FileTools.

## Getting Started
FileTools offers 95+ free tools for file conversion and processing.

## Features
- 100% client-side processing
- No file uploads required
- Fast and secure
- Works offline

## Popular Tools
- PDF compression and merging
- Image resizing and conversion
- Video compression
- Audio editing

Try FileTools today for all your file processing needs!`,
  };

  if (!post) {
    notFound();
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <article className="mx-auto max-w-3xl">
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center gap-2 text-purple-600 hover:underline"
        >
          ← Back to Blog
        </Link>

        <div className="mb-6">
          <span className="rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
            {post.category}
          </span>
          <span className="ml-4 text-sm text-zinc-500 dark:text-zinc-400">
            {post.date}
          </span>
        </div>

        <h1 className="mb-6 text-4xl font-bold md:text-5xl">{post.title}</h1>

        <div className="prose prose-zinc max-w-none dark:prose-invert">
          {post.content.split('\n').map((paragraph, index) => {
            const sanitized = sanitizeText(paragraph);
            if (paragraph.startsWith('# ')) {
              return <h1 key={index} className="text-3xl font-bold mt-8 mb-4" dangerouslySetInnerHTML={{ __html: sanitized.slice(2) }} />;
            } else if (paragraph.startsWith('## ')) {
              return <h2 key={index} className="text-2xl font-bold mt-6 mb-3" dangerouslySetInnerHTML={{ __html: sanitized.slice(3) }} />;
            } else if (paragraph.startsWith('### ')) {
              return <h3 key={index} className="text-xl font-bold mt-4 mb-2" dangerouslySetInnerHTML={{ __html: sanitized.slice(4) }} />;
            } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
              return <p key={index} className="font-bold my-2" dangerouslySetInnerHTML={{ __html: sanitized.slice(2, -2) }} />;
            } else if (paragraph.startsWith('- ')) {
              return <li key={index} className="ml-6 my-1" dangerouslySetInnerHTML={{ __html: sanitized.slice(2) }} />;
            } else if (paragraph.trim()) {
              return <p key={index} className="my-4" dangerouslySetInnerHTML={{ __html: sanitized }} />;
            }
            return null;
          })}
        </div>
      </article>
    </main>
  );
}
