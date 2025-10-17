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
          {
            name: "Merge PDFs",
            description: "Combine multiple PDFs into one",
            isOffline: true,
            icon: "merge",
            status: "working"
          },
          {
            name: "Split PDF",
            description: "Split PDF into multiple files",
            isOffline: true,
            icon: "split",
            status: "working"
          },
          {
            name: "Compress PDF",
            description: "Reduce PDF file size",
            isOffline: true,
            icon: "compress",
            status: "working"
          },
          {
            name: "Extract Images",
            description: "Extract all images from PDF",
            isOffline: true,
            icon: "image",
            status: "working"
          },
          {
            name: "Extract Text",
            description: "Extract text content from PDF",
            isOffline: true,
            icon: "text",
            status: "working"
          },
          {
            name: "Rotate Pages",
            description: "Rotate PDF pages",
            isOffline: true,
            icon: "rotate",
            status: "working"
          },
          {
            name: "Remove Pages",
            description: "Delete specific pages from PDF",
            isOffline: true,
            icon: "delete",
            status: "working"
          },
          {
            name: "Add Watermark",
            description: "Add watermark to PDF pages",
            isOffline: true,
            icon: "watermark",
            status: "working"
          },
          {
            name: "Protect PDF",
            description: "Add password protection",
            isOffline: true,
            icon: "lock",
            status: "working"
          },
          {
            name: "Unlock PDF",
            description: "Remove password protection",
            isOffline: true,
            icon: "unlock",
            status: "working"
          },
          {
            name: "PDF to Word",
            description: "Convert PDF to DOCX",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "PDF to Excel",
            description: "Convert PDF to XLSX",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "PDF to JPG",
            description: "Convert PDF pages to images",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "Organize Pages",
            description: "Reorder PDF pages",
            isOffline: true,
            icon: "organize",
            status: "working"
          }
        ]
      },
      {
        extension: "docx",
        name: "Word",
        description: "Microsoft Word Document",
        icon: "document",
        color: "gradient-document",
        isOffline: false,
        tools: [
          {
            name: "Convert to PDF",
            description: "Convert Word to PDF format",
            isOffline: true,
            icon: "convert",
            status: "maintenance"
          },
          {
            name: "Extract Text",
            description: "Extract plain text from Word",
            isOffline: true,
            icon: "text",
            status: "maintenance"
          }
        ]
      },
      {
        extension: "xlsx",
        name: "Excel",
        description: "Microsoft Excel Spreadsheet",
        icon: "table",
        color: "gradient-document",
        isOffline: false,
        tools: [
          {
            name: "Convert to PDF",
            description: "Convert Excel to PDF format",
            isOffline: true,
            icon: "convert",
            status: "maintenance"
          },
          {
            name: "Extract CSV",
            description: "Convert Excel to CSV format",
            isOffline: true,
            icon: "table",
            status: "maintenance"
          }
        ]
      },
      {
        extension: "pptx",
        name: "PowerPoint",
        description: "PowerPoint Presentation",
        icon: "presentation",
        color: "gradient-document",
        isOffline: false,
        tools: [
          {
            name: "Convert to PDF",
            description: "Convert PowerPoint to PDF",
            isOffline: true,
            icon: "convert",
            status: "maintenance"
          },
          {
            name: "Extract Images",
            description: "Extract images from slides",
            isOffline: true,
            icon: "image",
            status: "maintenance"
          }
        ]
      },
      {
        extension: "txt",
        name: "Text",
        description: "Text Document",
        icon: "text",
        color: "gradient-document",
        isOffline: true,
        tools: [
          {
            name: "Convert to PDF",
            description: "Convert text to PDF format",
            isOffline: true,
            icon: "convert",
            status: "maintenance"
          },
          {
            name: "Format Text",
            description: "Format and prettify text",
            isOffline: true,
            icon: "format",
            status: "maintenance"
          }
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
          {
            name: "Convert to Excel",
            description: "Convert CSV to XLSX format",
            isOffline: true,
            icon: "convert",
            status: "maintenance"
          },
          {
            name: "Convert to JSON",
            description: "Convert CSV to JSON format",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "Validate CSV",
            description: "Check CSV structure",
            isOffline: true,
            icon: "check",
            status: "maintenance"
          }
        ]
      },
      {
        extension: "json",
        name: "JSON",
        description: "JavaScript Object Notation",
        icon: "code",
        color: "gradient-code",
        isOffline: true,
        tools: [
          {
            name: "Format JSON",
            description: "Prettify and format JSON",
            isOffline: true,
            icon: "format",
            status: "working"
          },
          {
            name: "Minify JSON",
            description: "Compress JSON file",
            isOffline: true,
            icon: "compress",
            status: "working"
          },
          {
            name: "Validate JSON",
            description: "Check JSON syntax",
            isOffline: true,
            icon: "check",
            status: "working"
          },
          {
            name: "Convert to CSV",
            description: "Convert JSON to CSV",
            isOffline: true,
            icon: "convert",
            status: "working"
          }
        ]
      },
      {
        extension: "xml",
        name: "XML",
        description: "Extensible Markup Language",
        icon: "code",
        color: "gradient-code",
        isOffline: true,
        tools: [
          {
            name: "Format XML",
            description: "Prettify and format XML",
            isOffline: true,
            icon: "format",
            status: "working"
          },
          {
            name: "Validate XML",
            description: "Check XML syntax",
            isOffline: true,
            icon: "check",
            status: "working"
          },
          {
            name: "Convert to JSON",
            description: "Convert XML to JSON",
            isOffline: true,
            icon: "convert",
            status: "maintenance"
          }
        ]
      },
      {
        extension: "rtf",
        name: "RTF",
        description: "Rich Text Format",
        icon: "document",
        color: "gradient-document",
        isOffline: true,
        tools: [
          {
            name: "Convert to PDF",
            description: "Convert RTF to PDF",
            isOffline: true,
            icon: "convert",
            status: "maintenance"
          },
          {
            name: "Convert to DOCX",
            description: "Convert RTF to Word",
            isOffline: true,
            icon: "convert",
            status: "maintenance"
          }
        ]
      },
      {
        extension: "md",
        name: "Markdown",
        description: "Markdown Document",
        icon: "text",
        color: "gradient-document",
        isOffline: true,
        tools: [
          {
            name: "Convert to HTML",
            description: "Convert Markdown to HTML",
            isOffline: true,
            icon: "convert",
            status: "maintenance"
          },
          {
            name: "Convert to PDF",
            description: "Convert Markdown to PDF",
            isOffline: true,
            icon: "convert",
            status: "maintenance"
          },
          {
            name: "Preview",
            description: "Preview Markdown rendering",
            isOffline: true,
            icon: "view",
            status: "maintenance"
          }
        ]
      }
    ]
  },
  {
    name: "Images",
    description: "Process and modify image files",
    isOffline: true,
    types: [
      {
        extension: "jpg",
        name: "JPEG",
        description: "Joint Photographic Experts Group",
        icon: "image",
        color: "gradient-image",
        isOffline: true,
        tools: [
          {
            name: "Convert Format",
            description: "Convert to PNG, WebP, etc.",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "Compress",
            description: "Reduce image file size",
            isOffline: true,
            icon: "compress",
            status: "working"
          },
          {
            name: "Resize",
            description: "Change image dimensions",
            isOffline: true,
            icon: "resize",
            status: "working"
          },
          {
            name: "Crop",
            description: "Crop image to specific area",
            isOffline: true,
            icon: "crop",
            status: "working"
          },
          {
            name: "Rotate",
            description: "Rotate or flip image",
            isOffline: true,
            icon: "rotate",
            status: "working"
          },
          {
            name: "Add Watermark",
            description: "Add watermark to image",
            isOffline: true,
            icon: "watermark",
            status: "working"
          },
          {
            name: "Add Text",
            description: "Add text overlay to image",
            isOffline: true,
            icon: "text",
            status: "maintenance"
          },
          {
            name: "Apply Filters",
            description: "Apply color filters and effects",
            isOffline: true,
            icon: "filter",
            status: "working"
          },
          {
            name: "Adjust Brightness",
            description: "Adjust brightness and contrast",
            isOffline: true,
            icon: "adjust",
            status: "working"
          },
          {
            name: "Remove Background",
            description: "Remove image background",
            isOffline: false,
            icon: "remove",
            status: "maintenance"
          },
          {
            name: "Blur Image",
            description: "Apply blur effect",
            isOffline: true,
            icon: "blur",
            status: "working"
          },
          {
            name: "Sharpen Image",
            description: "Enhance image sharpness",
            isOffline: true,
            icon: "sharpen",
            status: "working"
          }
        ]
      },
      {
        extension: "png",
        name: "PNG",
        description: "Portable Network Graphics",
        icon: "image",
        color: "gradient-image",
        isOffline: true,
        tools: [
          {
            name: "Convert Format",
            description: "Convert to JPG, WebP, etc.",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "Compress",
            description: "Reduce image file size",
            isOffline: true,
            icon: "compress",
            status: "working"
          },
          {
            name: "Resize",
            description: "Change image dimensions",
            isOffline: true,
            icon: "resize",
            status: "working"
          },
          {
            name: "Crop",
            description: "Crop image to specific area",
            isOffline: true,
            icon: "crop",
            status: "working"
          },
          {
            name: "Remove Background",
            description: "Remove image background",
            isOffline: false,
            icon: "remove",
            status: "maintenance"
          },
          {
            name: "Add Transparency",
            description: "Make parts of image transparent",
            isOffline: true,
            icon: "transparency",
            status: "maintenance"
          },
          {
            name: "Rotate & Flip",
            description: "Rotate or flip image",
            isOffline: true,
            icon: "rotate",
            status: "working"
          },
          {
            name: "Add Watermark",
            description: "Add watermark to image",
            isOffline: true,
            icon: "watermark",
            status: "working"
          },
          {
            name: "Apply Filters",
            description: "Apply color filters",
            isOffline: true,
            icon: "filter",
            status: "working"
          }
        ]
      },
      {
        extension: "gif",
        name: "GIF",
        description: "Graphics Interchange Format",
        icon: "image",
        color: "gradient-image",
        isOffline: true,
        tools: [
          {
            name: "Convert Format",
            description: "Convert to MP4, WebP, etc.",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "Resize",
            description: "Change GIF dimensions",
            isOffline: true,
            icon: "resize",
            status: "working"
          },
          {
            name: "Optimize",
            description: "Reduce GIF file size",
            isOffline: true,
            icon: "compress",
            status: "working"
          },
          {
            name: "Reverse",
            description: "Reverse GIF animation",
            isOffline: true,
            icon: "rotate",
            status: "maintenance"
          }
        ]
      },
      {
        extension: "webp",
        name: "WebP",
        description: "Modern Web Image Format",
        icon: "image",
        color: "gradient-image",
        isOffline: true,
        tools: [
          {
            name: "Convert Format",
            description: "Convert to JPG, PNG, etc.",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "Compress",
            description: "Reduce file size",
            isOffline: true,
            icon: "compress",
            status: "working"
          },
          {
            name: "Resize",
            description: "Change dimensions",
            isOffline: true,
            icon: "resize",
            status: "working"
          }
        ]
      },
      {
        extension: "svg",
        name: "SVG",
        description: "Scalable Vector Graphics",
        icon: "image",
        color: "gradient-image",
        isOffline: true,
        tools: [
          {
            name: "Convert to PNG",
            description: "Convert SVG to PNG",
            isOffline: true,
            icon: "convert",
            status: "maintenance"
          },
          {
            name: "Optimize SVG",
            description: "Minify and clean SVG",
            isOffline: true,
            icon: "compress",
            status: "maintenance"
          },
          {
            name: "Edit SVG",
            description: "Edit SVG code",
            isOffline: true,
            icon: "edit",
            status: "maintenance"
          }
        ]
      },
      {
        extension: "bmp",
        name: "BMP",
        description: "Bitmap Image File",
        icon: "image",
        color: "gradient-image",
        isOffline: true,
        tools: [
          {
            name: "Convert Format",
            description: "Convert to JPG, PNG, etc.",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "Compress",
            description: "Reduce file size",
            isOffline: true,
            icon: "compress",
            status: "working"
          }
        ]
      },
      {
        extension: "ico",
        name: "ICO",
        description: "Icon File",
        icon: "image",
        color: "gradient-image",
        isOffline: true,
        tools: [
          {
            name: "Convert to PNG",
            description: "Convert ICO to PNG",
            isOffline: true,
            icon: "convert",
            status: "maintenance"
          },
          {
            name: "Create Favicon",
            description: "Create favicon from image",
            isOffline: true,
            icon: "create",
            status: "maintenance"
          }
        ]
      },
      {
        extension: "tiff",
        name: "TIFF",
        description: "Tagged Image File Format",
        icon: "image",
        color: "gradient-image",
        isOffline: true,
        tools: [
          {
            name: "Convert Format",
            description: "Convert to JPG, PNG, etc.",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "Compress",
            description: "Reduce file size",
            isOffline: true,
            icon: "compress",
            status: "working"
          }
        ]
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
        tools: [
          {
            name: "Convert Format",
            description: "Convert to WAV, OGG, etc.",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "Compress Audio",
            description: "Reduce audio file size",
            isOffline: true,
            icon: "compress",
            status: "working"
          },
          {
            name: "Trim Audio",
            description: "Cut and trim audio file",
            isOffline: true,
            icon: "cut",
            status: "working"
          },
          {
            name: "Merge Audio",
            description: "Combine multiple audio files",
            isOffline: true,
            icon: "merge",
            status: "working"
          },
          {
            name: "Change Volume",
            description: "Adjust audio volume",
            isOffline: true,
            icon: "volume",
            status: "working"
          },
          {
            name: "Change Speed",
            description: "Speed up or slow down audio",
            isOffline: true,
            icon: "speed",
            status: "working"
          },
          {
            name: "Add Fade",
            description: "Add fade in/out effects",
            isOffline: true,
            icon: "fade",
            status: "working"
          },
          {
            name: "Remove Noise",
            description: "Remove background noise",
            isOffline: false,
            icon: "clean",
            status: "maintenance"
          },
          {
            name: "Edit Metadata",
            description: "Edit song title, artist, etc.",
            isOffline: true,
            icon: "edit",
            status: "maintenance"
          },
          {
            name: "Extract Audio from Video",
            description: "Extract audio from video file",
            isOffline: true,
            icon: "extract",
            status: "working"
          },
          {
            name: "Reverse Audio",
            description: "Play audio in reverse",
            isOffline: true,
            icon: "reverse",
            status: "working"
          }
        ]
      },
      {
        extension: "wav",
        name: "WAV",
        description: "Waveform Audio File Format",
        icon: "audio",
        color: "gradient-audio",
        isOffline: true,
        tools: [
          {
            name: "Convert Format",
            description: "Convert to MP3, OGG, etc.",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "Compress",
            description: "Reduce audio file size",
            isOffline: true,
            icon: "compress",
            status: "working"
          }
        ]
      },
      {
        extension: "aac",
        name: "AAC",
        description: "Advanced Audio Coding",
        icon: "audio",
        color: "gradient-audio",
        isOffline: true,
        tools: [
          {
            name: "Convert Format",
            description: "Convert to MP3, WAV, etc.",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "Trim Audio",
            description: "Cut and trim audio",
            isOffline: true,
            icon: "cut",
            status: "working"
          }
        ]
      },
      {
        extension: "flac",
        name: "FLAC",
        description: "Free Lossless Audio Codec",
        icon: "audio",
        color: "gradient-audio",
        isOffline: true,
        tools: [
          {
            name: "Convert Format",
            description: "Convert to MP3, WAV, etc.",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "Compress",
            description: "Reduce file size",
            isOffline: true,
            icon: "compress",
            status: "working"
          }
        ]
      },
      {
        extension: "ogg",
        name: "OGG",
        description: "Ogg Vorbis Audio",
        icon: "audio",
        color: "gradient-audio",
        isOffline: true,
        tools: [
          {
            name: "Convert Format",
            description: "Convert to MP3, WAV, etc.",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "Trim Audio",
            description: "Cut and trim audio",
            isOffline: true,
            icon: "cut",
            status: "working"
          }
        ]
      },
      {
        extension: "m4a",
        name: "M4A",
        description: "MPEG-4 Audio",
        icon: "audio",
        color: "gradient-audio",
        isOffline: true,
        tools: [
          {
            name: "Convert Format",
            description: "Convert to MP3, WAV, etc.",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "Edit Metadata",
            description: "Edit audio tags",
            isOffline: true,
            icon: "edit",
            status: "maintenance"
          }
        ]
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
        tools: [
          {
            name: "Convert Format",
            description: "Convert to AVI, MOV, etc.",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "Compress Video",
            description: "Reduce video file size",
            isOffline: true,
            icon: "compress",
            status: "working"
          },
          {
            name: "Trim Video",
            description: "Cut and trim video file",
            isOffline: true,
            icon: "cut",
            status: "working"
          },
          {
            name: "Merge Videos",
            description: "Combine multiple videos",
            isOffline: true,
            icon: "merge",
            status: "working"
          },
          {
            name: "Extract Audio",
            description: "Extract audio from video",
            isOffline: true,
            icon: "audio",
            status: "working"
          },
          {
            name: "Add Subtitles",
            description: "Add subtitle file to video",
            isOffline: true,
            icon: "subtitle",
            status: "maintenance"
          },
          {
            name: "Remove Audio",
            description: "Mute video audio track",
            isOffline: true,
            icon: "mute",
            status: "working"
          },
          {
            name: "Rotate Video",
            description: "Rotate video orientation",
            isOffline: true,
            icon: "rotate",
            status: "working"
          },
          {
            name: "Change Speed",
            description: "Speed up or slow down video",
            isOffline: true,
            icon: "speed",
            status: "maintenance"
          },
          {
            name: "Crop Video",
            description: "Crop video dimensions",
            isOffline: true,
            icon: "crop",
            status: "working"
          },
          {
            name: "Add Watermark",
            description: "Add watermark to video",
            isOffline: true,
            icon: "watermark",
            status: "working"
          },
          {
            name: "Video to GIF",
            description: "Convert video to animated GIF",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "Extract Frames",
            description: "Extract video frames as images",
            isOffline: true,
            icon: "extract",
            status: "maintenance"
          },
          {
            name: "Reverse Video",
            description: "Play video in reverse",
            isOffline: true,
            icon: "reverse",
            status: "working"
          }
        ]
      },
      {
        extension: "avi",
        name: "AVI",
        description: "Audio Video Interleave",
        icon: "video",
        color: "gradient-video",
        isOffline: true,
        tools: [
          {
            name: "Convert Format",
            description: "Convert to MP4, MOV, etc.",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "Compress",
            description: "Reduce video file size",
            isOffline: true,
            icon: "compress",
            status: "working"
          }
        ]
      },
      {
        extension: "mov",
        name: "MOV",
        description: "QuickTime Movie",
        icon: "video",
        color: "gradient-video",
        isOffline: true,
        tools: [
          {
            name: "Convert Format",
            description: "Convert to MP4, AVI, etc.",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "Compress",
            description: "Reduce file size",
            isOffline: true,
            icon: "compress",
            status: "working"
          },
          {
            name: "Trim Video",
            description: "Cut and trim video",
            isOffline: true,
            icon: "cut",
            status: "working"
          }
        ]
      },
      {
        extension: "mkv",
        name: "MKV",
        description: "Matroska Video",
        icon: "video",
        color: "gradient-video",
        isOffline: true,
        tools: [
          {
            name: "Convert Format",
            description: "Convert to MP4, AVI, etc.",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "Extract Subtitles",
            description: "Extract subtitle tracks",
            isOffline: true,
            icon: "text",
            status: "maintenance"
          },
          {
            name: "Extract Audio",
            description: "Extract audio tracks",
            isOffline: true,
            icon: "audio",
            status: "working"
          }
        ]
      },
      {
        extension: "webm",
        name: "WebM",
        description: "Web Media File",
        icon: "video",
        color: "gradient-video",
        isOffline: true,
        tools: [
          {
            name: "Convert Format",
            description: "Convert to MP4, AVI, etc.",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "Compress",
            description: "Reduce file size",
            isOffline: true,
            icon: "compress",
            status: "working"
          }
        ]
      },
      {
        extension: "wmv",
        name: "WMV",
        description: "Windows Media Video",
        icon: "video",
        color: "gradient-video",
        isOffline: true,
        tools: [
          {
            name: "Convert Format",
            description: "Convert to MP4, AVI, etc.",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "Compress",
            description: "Reduce file size",
            isOffline: true,
            icon: "compress",
            status: "working"
          }
        ]
      },
      {
        extension: "flv",
        name: "FLV",
        description: "Flash Video",
        icon: "video",
        color: "gradient-video",
        isOffline: true,
        tools: [
          {
            name: "Convert Format",
            description: "Convert to MP4, AVI, etc.",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "Extract Audio",
            description: "Extract audio from video",
            isOffline: true,
            icon: "audio",
            status: "working"
          }
        ]
      },
      {
        extension: "m4v",
        name: "M4V",
        description: "iTunes Video",
        icon: "video",
        color: "gradient-video",
        isOffline: true,
        tools: [
          {
            name: "Convert Format",
            description: "Convert to MP4, AVI, etc.",
            isOffline: true,
            icon: "convert",
            status: "working"
          },
          {
            name: "Compress",
            description: "Reduce file size",
            isOffline: true,
            icon: "compress",
            status: "working"
          }
        ]
      }
    ]
  },
  {
    name: "Code",
    description: "Format and analyze code files",
    isOffline: true,
    types: [
      {
        extension: "js",
        name: "JavaScript",
        description: "JavaScript Source Code",
        icon: "code",
        color: "gradient-code",
        isOffline: true,
        tools: [
          {
            name: "Format Code",
            description: "Format and prettify code",
            isOffline: true,
            icon: "format",
            status: "working"
          },
          {
            name: "Minify",
            description: "Minify and compress code",
            isOffline: true,
            icon: "compress",
            status: "working"
          },
          {
            name: "Lint",
            description: "Check for code errors",
            isOffline: true,
            icon: "check",
            status: "maintenance"
          }
        ]
      },
      {
        extension: "html",
        name: "HTML",
        description: "HyperText Markup Language",
        icon: "code",
        color: "gradient-code",
        isOffline: true,
        tools: [
          {
            name: "Format Code",
            description: "Format and prettify code",
            isOffline: true,
            icon: "format",
            status: "maintenance"
          },
          {
            name: "Minify",
            description: "Minify and compress code",
            isOffline: true,
            icon: "compress",
            status: "maintenance"
          }
        ]
      },
      {
        extension: "css",
        name: "CSS",
        description: "Cascading Style Sheets",
        icon: "code",
        color: "gradient-code",
        isOffline: true,
        tools: [
          {
            name: "Format Code",
            description: "Format and prettify code",
            isOffline: true,
            icon: "format",
            status: "maintenance"
          },
          {
            name: "Minify",
            description: "Minify and compress code",
            isOffline: true,
            icon: "compress",
            status: "maintenance"
          }
        ]
      },
      {
        extension: "py",
        name: "Python",
        description: "Python Source Code",
        icon: "code",
        color: "gradient-code",
        isOffline: true,
        tools: [
          {
            name: "Format Code",
            description: "Format with Black/autopep8",
            isOffline: true,
            icon: "format",
            status: "maintenance"
          },
          {
            name: "Lint",
            description: "Check for errors",
            isOffline: true,
            icon: "check",
            status: "maintenance"
          }
        ]
      },
      {
        extension: "java",
        name: "Java",
        description: "Java Source Code",
        icon: "code",
        color: "gradient-code",
        isOffline: true,
        tools: [
          {
            name: "Format Code",
            description: "Format and prettify code",
            isOffline: true,
            icon: "format",
            status: "maintenance"
          },
          {
            name: "Lint",
            description: "Check for errors",
            isOffline: true,
            icon: "check",
            status: "maintenance"
          }
        ]
      },
      {
        extension: "ts",
        name: "TypeScript",
        description: "TypeScript Source Code",
        icon: "code",
        color: "gradient-code",
        isOffline: true,
        tools: [
          {
            name: "Format Code",
            description: "Format and prettify code",
            isOffline: true,
            icon: "format",
            status: "maintenance"
          },
          {
            name: "Compile to JS",
            description: "Compile TypeScript to JavaScript",
            isOffline: true,
            icon: "convert",
            status: "maintenance"
          },
          {
            name: "Lint",
            description: "Check for errors",
            isOffline: true,
            icon: "check",
            status: "maintenance"
          }
        ]
      },
      {
        extension: "php",
        name: "PHP",
        description: "PHP Source Code",
        icon: "code",
        color: "gradient-code",
        isOffline: true,
        tools: [
          {
            name: "Format Code",
            description: "Format and prettify code",
            isOffline: true,
            icon: "format",
            status: "maintenance"
          },
          {
            name: "Lint",
            description: "Check for errors",
            isOffline: true,
            icon: "check",
            status: "maintenance"
          }
        ]
      },
      {
        extension: "sql",
        name: "SQL",
        description: "Structured Query Language",
        icon: "code",
        color: "gradient-code",
        isOffline: true,
        tools: [
          {
            name: "Format SQL",
            description: "Format and prettify SQL",
            isOffline: true,
            icon: "format",
            status: "maintenance"
          },
          {
            name: "Validate",
            description: "Check SQL syntax",
            isOffline: true,
            icon: "check",
            status: "maintenance"
          }
        ]
      }
    ]
  },
  {
    name: "Archives",
    description: "Compress and extract archive files",
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
          {
            name: "Extract",
            description: "Extract ZIP contents",
            isOffline: true,
            icon: "extract",
            status: "working"
          },
          {
            name: "Create ZIP",
            description: "Create ZIP archive",
            isOffline: true,
            icon: "compress",
            status: "working"
          },
          {
            name: "View Contents",
            description: "List files in archive",
            isOffline: true,
            icon: "view",
            status: "working"
          }
        ]
      },
      {
        extension: "rar",
        name: "RAR",
        description: "RAR Archive",
        icon: "archive",
        color: "gradient-archive",
        isOffline: true,
        tools: [
          {
            name: "Extract",
            description: "Extract RAR contents",
            isOffline: true,
            icon: "extract",
            status: "maintenance"
          },
          {
            name: "View Contents",
            description: "List files in archive",
            isOffline: true,
            icon: "view",
            status: "maintenance"
          }
        ]
      },
      {
        extension: "7z",
        name: "7-Zip",
        description: "7-Zip Archive",
        icon: "archive",
        color: "gradient-archive",
        isOffline: true,
        tools: [
          {
            name: "Extract",
            description: "Extract 7z contents",
            isOffline: true,
            icon: "extract",
            status: "maintenance"
          },
          {
            name: "Create 7z",
            description: "Create 7z archive",
            isOffline: true,
            icon: "compress",
            status: "maintenance"
          }
        ]
      },
      {
        extension: "tar",
        name: "TAR",
        description: "Tape Archive",
        icon: "archive",
        color: "gradient-archive",
        isOffline: true,
        tools: [
          {
            name: "Extract",
            description: "Extract TAR contents",
            isOffline: true,
            icon: "extract",
            status: "maintenance"
          },
          {
            name: "Create TAR",
            description: "Create TAR archive",
            isOffline: true,
            icon: "compress",
            status: "maintenance"
          }
        ]
      },
      {
        extension: "gz",
        name: "GZIP",
        description: "GNU Zip Archive",
        icon: "archive",
        color: "gradient-archive",
        isOffline: true,
        tools: [
          {
            name: "Extract",
            description: "Extract GZIP contents",
            isOffline: true,
            icon: "extract",
            status: "maintenance"
          },
          {
            name: "Compress",
            description: "Create GZIP archive",
            isOffline: true,
            icon: "compress",
            status: "maintenance"
          }
        ]
      }
    ]
  }
];