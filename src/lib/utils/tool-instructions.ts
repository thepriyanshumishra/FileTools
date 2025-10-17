export const toolInstructions: Record<string, { steps: string[]; tips: string[] }> = {
  // Image Tools
  "Compress": {
    steps: ["Upload your image", "Processing will start automatically", "Download the compressed file"],
    tips: ["Reduces file size while maintaining quality", "Great for web optimization"]
  },
  "Resize": {
    steps: ["Upload your image", "Enter desired dimensions", "Download resized image"],
    tips: ["Maintains aspect ratio by default", "Perfect for social media posts"]
  },
  "Convert Format": {
    steps: ["Upload your file", "Select output format", "Download converted file"],
    tips: ["Supports all major formats", "No quality loss"]
  },
  "Crop": {
    steps: ["Upload your image", "Select crop area", "Download cropped image"],
    tips: ["Precise pixel control", "Multiple aspect ratios"]
  },
  "Rotate": {
    steps: ["Upload your file", "Select rotation angle", "Download rotated file"],
    tips: ["90°, 180°, 270° options", "No quality loss"]
  },
  "Adjust Brightness": {
    steps: ["Upload your image", "Adjust brightness slider", "Download enhanced image"],
    tips: ["Real-time preview", "Fine-tune lighting"]
  },
  
  // PDF Tools
  "Merge PDFs": {
    steps: ["Upload multiple PDFs", "Drag to reorder", "Download merged PDF"],
    tips: ["Unlimited files", "Maintains formatting"]
  },
  "Split PDF": {
    steps: ["Upload PDF", "Select split points", "Download individual pages"],
    tips: ["Extract specific pages", "Batch processing"]
  },
  "Rotate Pages": {
    steps: ["Upload PDF", "Select pages to rotate", "Download rotated PDF"],
    tips: ["Rotate individual or all pages", "90° increments"]
  },
  "Remove Pages": {
    steps: ["Upload PDF", "Select pages to remove", "Download edited PDF"],
    tips: ["Multi-select support", "Preview before removing"]
  },
  
  // Video Tools
  "Compress Video": {
    steps: ["Upload video", "Select quality", "Download compressed video"],
    tips: ["Reduces file size significantly", "Maintains playback quality"]
  },
  "Trim Video": {
    steps: ["Upload video", "Set start/end times", "Download trimmed video"],
    tips: ["Precise frame control", "No re-encoding"]
  },
  "Extract Audio": {
    steps: ["Upload video", "Processing starts automatically", "Download audio file"],
    tips: ["High-quality audio extraction", "Multiple format support"]
  },
  "Video to GIF": {
    steps: ["Upload video", "Select duration", "Download GIF"],
    tips: ["Perfect for animations", "Adjustable frame rate"]
  },
  
  // Audio Tools
  "Compress Audio": {
    steps: ["Upload audio", "Select bitrate", "Download compressed audio"],
    tips: ["Reduces file size", "Maintains audio quality"]
  },
  "Trim Audio": {
    steps: ["Upload audio", "Set start/end times", "Download trimmed audio"],
    tips: ["Millisecond precision", "Fade in/out options"]
  },
  "Merge Audio": {
    steps: ["Upload multiple audio files", "Arrange order", "Download merged audio"],
    tips: ["Seamless transitions", "Multiple format support"]
  },
  "Change Volume": {
    steps: ["Upload audio", "Adjust volume slider", "Download modified audio"],
    tips: ["Boost or reduce volume", "No distortion"]
  },
  "Change Speed": {
    steps: ["Upload audio", "Select speed multiplier", "Download modified audio"],
    tips: ["0.5x to 2x speed", "Maintains pitch"]
  },
  "Add Fade": {
    steps: ["Upload audio", "Set fade duration", "Download with fade effect"],
    tips: ["Fade in/out options", "Professional transitions"]
  }
};

export function getToolInstructions(toolName: string) {
  return toolInstructions[toolName] || {
    steps: ["Upload your file", "Processing will start automatically", "Download the result"],
    tips: ["Fast processing", "Secure and private"]
  };
}
