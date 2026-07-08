export type FileCategory = {
  name: string;
  description: string;
  types: FileType[];
  isOffline: boolean;
};

export type FileType = {
  extension: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isOffline: boolean;
  tools: FileTool[];
};

export type FileTool = {
  name: string;
  description: string;
  isOffline: boolean;
  icon: string;
  status: 'working' | 'maintenance';
};

// Reusable standard tools lists
const standardImageTools: FileTool[] = [
  { name: "Compress", description: "Reduce image file size", isOffline: true, icon: "compress", status: "working" },
  { name: "Resize", description: "Change image dimensions", isOffline: true, icon: "resize", status: "working" },
  { name: "Convert Format", description: "Convert image extension", isOffline: true, icon: "convert", status: "working" },
  { name: "Rotate", description: "Rotate image degrees", isOffline: true, icon: "rotate", status: "working" },
  { name: "Crop", description: "Crop specific region visually", isOffline: true, icon: "crop", status: "working" },
  { name: "Rotate & Flip", description: "Flip image horizontally or vertically", isOffline: true, icon: "flip", status: "working" },
  { name: "Adjust Brightness", description: "Make image darker or brighter", isOffline: true, icon: "brightness", status: "working" },
  { name: "Apply Filters", description: "Apply creative visual filters", isOffline: true, icon: "filter", status: "working" },
  { name: "Blur Image", description: "Apply blur effect to image", isOffline: true, icon: "blur", status: "working" },
  { name: "Sharpen Image", description: "Sharpen blurry details", isOffline: true, icon: "sharpen", status: "working" },
  { name: "Add Watermark", description: "Add watermark text on top", isOffline: true, icon: "watermark", status: "working" }
];

const standardAudioTools: FileTool[] = [
  { name: "Convert Format", description: "Convert to MP3, WAV, OGG, etc.", isOffline: true, icon: "convert", status: "working" },
  { name: "Compress Audio", description: "Reduce audio file size", isOffline: true, icon: "compress", status: "working" },
  { name: "Trim Audio", description: "Cut and trim audio segments", isOffline: true, icon: "cut", status: "working" },
  { name: "Merge Audio", description: "Combine multiple audio files", isOffline: true, icon: "merge", status: "working" },
  { name: "Change Volume", description: "Adjust audio loudness", isOffline: true, icon: "volume", status: "working" },
  { name: "Change Speed", description: "Adjust playback speed", isOffline: true, icon: "speed", status: "working" },
  { name: "Add Fade", description: "Add fade in/out effects", isOffline: true, icon: "fade", status: "working" },
  { name: "Reverse Audio", description: "Play audio in reverse", isOffline: true, icon: "reverse", status: "working" }
];

const standardVideoTools: FileTool[] = [
  { name: "Convert Format", description: "Convert to MP4, AVI, MOV, etc.", isOffline: true, icon: "convert", status: "working" },
  { name: "Compress Video", description: "Reduce video file size", isOffline: true, icon: "compress", status: "working" },
  { name: "Trim Video", description: "Cut and trim video segments", isOffline: true, icon: "cut", status: "working" },
  { name: "Merge Videos", description: "Combine multiple videos", isOffline: true, icon: "merge", status: "working" },
  { name: "Extract Audio", description: "Extract audio track from video", isOffline: true, icon: "audio", status: "working" },
  { name: "Remove Audio", description: "Mute video audio track", isOffline: true, icon: "mute", status: "working" },
  { name: "Crop Video", description: "Crop video dimensions", isOffline: true, icon: "crop", status: "working" },
  { name: "Change Speed", description: "Change video playback speed", isOffline: true, icon: "speed", status: "working" },
  { name: "Reverse Video", description: "Play video backwards", isOffline: true, icon: "reverse", status: "working" }
];

export const fileCategories: FileCategory[] = [
  {
    name: "Documents",
    description: "Process and convert document files",
    isOffline: true,
    types: [
      {
        extension: "pdf",
        name: "PDF",
        description: "Portable Document Format",
        icon: "document",
        color: "gradient-document",
        isOffline: true,
        tools: [
          { name: "Merge PDFs", description: "Combine multiple PDFs into one", isOffline: true, icon: "merge", status: "working" },
          { name: "Split PDF", description: "Split PDF into multiple files", isOffline: true, icon: "split", status: "working" },
          { name: "Compress PDF", description: "Reduce PDF file size", isOffline: true, icon: "compress", status: "working" },
          { name: "Extract Images", description: "Extract all images from PDF", isOffline: true, icon: "image", status: "working" },
          { name: "Extract Text", description: "Extract text content from PDF", isOffline: true, icon: "text", status: "working" },
          { name: "Rotate Pages", description: "Rotate PDF pages", isOffline: true, icon: "rotate", status: "working" },
          { name: "Remove Pages", description: "Delete specific pages from PDF", isOffline: true, icon: "delete", status: "working" },
          { name: "Add Watermark", description: "Add watermark to PDF pages", isOffline: true, icon: "watermark", status: "working" },
          { name: "Protect PDF", description: "Add password protection", isOffline: true, icon: "lock", status: "working" },
          { name: "Unlock PDF", description: "Remove password protection", isOffline: true, icon: "unlock", status: "working" },
          { name: "PDF to JPG", description: "Convert PDF pages to images", isOffline: true, icon: "convert", status: "working" },
          { name: "Organize Pages", description: "Reorder PDF pages", isOffline: true, icon: "organize", status: "working" }
        ]
      },
      {
        extension: "csv",
        name: "CSV",
        description: "Comma-Separated Values",
        icon: "table",
        color: "gradient-document",
        isOffline: true,
        tools: [
          { name: "Convert to JSON", description: "Convert table data to JSON", isOffline: true, icon: "convert", status: "working" },
          { name: "Validate CSV", description: "Check CSV for format errors", isOffline: true, icon: "validate", status: "working" }
        ]
      },
      {
        extension: "json",
        name: "JSON",
        description: "JavaScript Object Notation",
        icon: "code",
        color: "gradient-document",
        isOffline: true,
        tools: [
          { name: "Format JSON", description: "Pretty print JSON formatting", isOffline: true, icon: "format", status: "working" },
          { name: "Minify JSON", description: "Compact JSON structure", isOffline: true, icon: "minify", status: "working" },
          { name: "Validate JSON", description: "Check JSON for syntax errors", isOffline: true, icon: "validate", status: "working" },
          { name: "Convert to CSV", description: "Convert list data to CSV", isOffline: true, icon: "convert", status: "working" }
        ]
      },
      {
        extension: "xml",
        name: "XML",
        description: "Extensible Markup Language",
        icon: "code",
        color: "gradient-document",
        isOffline: true,
        tools: [
          { name: "Format XML", description: "Format and indent XML", isOffline: true, icon: "format", status: "working" },
          { name: "Validate XML", description: "Check XML for parsing errors", isOffline: true, icon: "validate", status: "working" }
        ]
      },
      {
        extension: "txt",
        name: "Text",
        description: "Plain Text Document",
        icon: "document",
        color: "gradient-document",
        isOffline: true,
        tools: [
          { name: "Convert to PDF", description: "Convert plain text to PDF file", isOffline: true, icon: "convert", status: "working" },
          { name: "Format Text", description: "Format casing, trim or reverse text", isOffline: true, icon: "format", status: "working" }
        ]
      },
      {
        extension: "md",
        name: "Markdown",
        description: "Markdown Documentation",
        icon: "document",
        color: "gradient-document",
        isOffline: true,
        tools: [
          { name: "Convert to HTML", description: "Convert Markdown to HTML file", isOffline: true, icon: "convert", status: "working" },
          { name: "Convert to PDF", description: "Convert Markdown to PDF file", isOffline: true, icon: "convert", status: "working" },
          { name: "Preview", description: "Preview Markdown rendered as HTML", isOffline: true, icon: "search", status: "working" }
        ]
      },
      {
        extension: "pptx",
        name: "PowerPoint",
        description: "Microsoft PowerPoint Presentation",
        icon: "presentation",
        color: "gradient-document",
        isOffline: true,
        tools: [
          { name: "Extract Slide Images", description: "Extract slide graphics as pictures", isOffline: true, icon: "image", status: "working" },
          { name: "Extract Slide Text", description: "Extract slide text paragraphs to text file", isOffline: true, icon: "text", status: "working" }
        ]
      },
      {
        extension: "docx",
        name: "Word",
        description: "Microsoft Word Document",
        icon: "document",
        color: "gradient-document",
        isOffline: true,
        tools: [
          { name: "Extract Word Text", description: "Extract raw text content to text file", isOffline: true, icon: "text", status: "working" },
          { name: "Convert to HTML", description: "Convert Word document to HTML page", isOffline: true, icon: "convert", status: "working" }
        ]
      },
      {
        extension: "xlsx",
        name: "Excel",
        description: "Microsoft Excel Spreadsheet",
        icon: "table",
        color: "gradient-document",
        isOffline: true,
        tools: [
          { name: "Preview Sheet", description: "View spreadsheet rows as interactive tables", isOffline: true, icon: "search", status: "working" },
          { name: "Convert to CSV", description: "Convert spreadsheet sheets to CSV format", isOffline: true, icon: "convert", status: "working" },
          { name: "Excel to JSON", description: "Convert spreadsheet tables to JSON collection", isOffline: true, icon: "convert", status: "working" }
        ]
      }
    ]
  },
  {
    name: "Images",
    description: "Process and convert image files",
    isOffline: true,
    types: [
      {
        extension: "jpeg",
        name: "JPEG",
        description: "Joint Photographic Experts Group",
        icon: "image",
        color: "gradient-image",
        isOffline: true,
        tools: standardImageTools
      },
      {
        extension: "png",
        name: "PNG",
        description: "Portable Network Graphics",
        icon: "image",
        color: "gradient-image",
        isOffline: true,
        tools: standardImageTools
      },
      {
        extension: "webp",
        name: "WebP",
        description: "Google Web Picture Format",
        icon: "image",
        color: "gradient-image",
        isOffline: true,
        tools: standardImageTools
      }
    ]
  },
  {
    name: "Audio",
    description: "Process and convert audio files",
    isOffline: true,
    types: [
      {
        extension: "mp3",
        name: "MP3",
        description: "MPEG Audio Layer III",
        icon: "audio",
        color: "gradient-audio",
        isOffline: true,
        tools: standardAudioTools
      },
      {
        extension: "wav",
        name: "WAV",
        description: "Waveform Audio File Format",
        icon: "audio",
        color: "gradient-audio",
        isOffline: true,
        tools: standardAudioTools
      },
      {
        extension: "aac",
        name: "AAC",
        description: "Advanced Audio Coding",
        icon: "audio",
        color: "gradient-audio",
        isOffline: true,
        tools: standardAudioTools
      },
      {
        extension: "flac",
        name: "FLAC",
        description: "Free Lossless Audio Codec",
        icon: "audio",
        color: "gradient-audio",
        isOffline: true,
        tools: standardAudioTools
      },
      {
        extension: "ogg",
        name: "OGG",
        description: "Ogg Vorbis Audio",
        icon: "audio",
        color: "gradient-audio",
        isOffline: true,
        tools: standardAudioTools
      },
      {
        extension: "m4a",
        name: "M4A",
        description: "MPEG-4 Audio",
        icon: "audio",
        color: "gradient-audio",
        isOffline: true,
        tools: standardAudioTools
      }
    ]
  },
  {
    name: "Video",
    description: "Process and convert video files",
    isOffline: true,
    types: [
      {
        extension: "mp4",
        name: "MP4",
        description: "MPEG-4 Video",
        icon: "video",
        color: "gradient-video",
        isOffline: true,
        tools: standardVideoTools
      },
      {
        extension: "avi",
        name: "AVI",
        description: "Audio Video Interleave",
        icon: "video",
        color: "gradient-video",
        isOffline: true,
        tools: standardVideoTools
      },
      {
        extension: "mov",
        name: "MOV",
        description: "Apple QuickTime Movie",
        icon: "video",
        color: "gradient-video",
        isOffline: true,
        tools: standardVideoTools
      },
      {
        extension: "mkv",
        name: "MKV",
        description: "Matroska Multimedia Container",
        icon: "video",
        color: "gradient-video",
        isOffline: true,
        tools: standardVideoTools
      },
      {
        extension: "webm",
        name: "WebM",
        description: "WebM Open Media Video",
        icon: "video",
        color: "gradient-video",
        isOffline: true,
        tools: standardVideoTools
      }
    ]
  },
  {
    name: "Archives",
    description: "Manage compressed archive files",
    isOffline: true,
    types: [
      {
        extension: "zip",
        name: "ZIP",
        description: "ZIP Archive",
        icon: "archive",
        color: "gradient-archive",
        isOffline: true,
        tools: [
          { name: "Create ZIP", description: "Compress files into a ZIP archive", isOffline: true, icon: "compress", status: "working" },
          { name: "Extract", description: "Decompress and extract ZIP files", isOffline: true, icon: "decompress", status: "working" },
          { name: "View Contents", description: "Explore files inside ZIP", isOffline: true, icon: "search", status: "working" }
        ]
      }
    ]
  }
];