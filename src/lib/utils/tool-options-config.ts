interface ToolOption {
  id: string;
  label: string;
  type: "select" | "number" | "slider" | "toggle" | "text";
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue: string | number | boolean;
  description?: string;
}

export const toolOptionsConfig: Record<string, ToolOption[]> = {
  "Compress": [
    {
      id: "quality",
      label: "Quality",
      type: "slider",
      min: 1,
      max: 100,
      step: 1,
      defaultValue: 80,
      description: "Higher quality = larger file size"
    },
    {
      id: "format",
      label: "Output Format",
      type: "select",
      options: ["Same as input", "JPEG", "PNG", "WebP"],
      defaultValue: "Same as input"
    }
  ],
  "Resize": [
    {
      id: "width",
      label: "Width (px)",
      type: "number",
      min: 1,
      max: 10000,
      step: 1,
      defaultValue: 1920
    },
    {
      id: "height",
      label: "Height (px)",
      type: "number",
      min: 1,
      max: 10000,
      step: 1,
      defaultValue: 1080
    },
    {
      id: "maintainAspectRatio",
      label: "Maintain Aspect Ratio",
      type: "toggle",
      defaultValue: true
    }
  ],
  "Crop": [
    {
      id: "x",
      label: "X Position",
      type: "number",
      min: 0,
      max: 10000,
      step: 1,
      defaultValue: 0
    },
    {
      id: "y",
      label: "Y Position",
      type: "number",
      min: 0,
      max: 10000,
      step: 1,
      defaultValue: 0
    },
    {
      id: "width",
      label: "Width",
      type: "number",
      min: 1,
      max: 10000,
      step: 1,
      defaultValue: 500
    },
    {
      id: "height",
      label: "Height",
      type: "number",
      min: 1,
      max: 10000,
      step: 1,
      defaultValue: 500
    }
  ],
  "Rotate": [
    {
      id: "angle",
      label: "Rotation Angle",
      type: "select",
      options: ["90°", "180°", "270°", "Custom"],
      defaultValue: "90°"
    }
  ],
  "Adjust Brightness": [
    {
      id: "brightness",
      label: "Brightness",
      type: "slider",
      min: -100,
      max: 100,
      step: 1,
      defaultValue: 0,
      description: "Negative = darker, Positive = brighter"
    }
  ],
  "Compress Video": [
    {
      id: "quality",
      label: "Quality",
      type: "select",
      options: ["Low", "Medium", "High"],
      defaultValue: "Medium"
    },
    {
      id: "resolution",
      label: "Resolution",
      type: "select",
      options: ["Keep original", "1080p", "720p", "480p"],
      defaultValue: "Keep original"
    }
  ],
  "Trim Video": [
    {
      id: "startTime",
      label: "Start Time (seconds)",
      type: "number",
      min: 0,
      max: 3600,
      step: 0.1,
      defaultValue: 0
    },
    {
      id: "endTime",
      label: "End Time (seconds)",
      type: "number",
      min: 0,
      max: 3600,
      step: 0.1,
      defaultValue: 10
    }
  ],
  "Compress Audio": [
    {
      id: "bitrate",
      label: "Bitrate",
      type: "select",
      options: ["64 kbps", "128 kbps", "192 kbps", "256 kbps", "320 kbps"],
      defaultValue: "192 kbps"
    }
  ],
  "Change Volume": [
    {
      id: "volume",
      label: "Volume",
      type: "slider",
      min: 0,
      max: 200,
      step: 1,
      defaultValue: 100,
      description: "100 = original volume"
    }
  ],
  "Change Speed": [
    {
      id: "speed",
      label: "Speed",
      type: "select",
      options: ["0.5x", "0.75x", "1x", "1.25x", "1.5x", "2x"],
      defaultValue: "1x"
    }
  ],
  "Format Text": [
    {
      id: "action",
      label: "Text Operation",
      type: "select",
      options: ["uppercase", "lowercase", "trim", "reverse"],
      defaultValue: "uppercase"
    }
  ],
  "Convert Format": [
    {
      id: "format",
      label: "Output Format",
      type: "select",
      options: ["JPEG", "PNG", "WebP"],
      defaultValue: "PNG",
      description: "Select target image format"
    }
  ],
  "Add Watermark": [
    {
      id: "text",
      label: "Watermark Text",
      type: "text",
      defaultValue: "CONFIDENTIAL",
      description: "Text stamped diagonally on your file"
    },
    {
      id: "opacity",
      label: "Opacity (%)",
      type: "slider",
      min: 10,
      max: 100,
      step: 10,
      defaultValue: 40
    }
  ],
  "Convert to CSV": [
    {
      id: "delimiter",
      label: "Delimiter Symbol",
      type: "select",
      options: ["Comma (,)", "Semicolon (;)", "Tab (\\t)"],
      defaultValue: "Comma (,)"
    }
  ],
  "Convert to JSON": [
    {
      id: "formatting",
      label: "JSON Structure",
      type: "select",
      options: ["Minified (Single line)", "Beautified (Indented)"],
      defaultValue: "Beautified (Indented)"
    }
  ],
  "Validate CSV": [
    {
      id: "delimiter",
      label: "CSV Delimiter",
      type: "select",
      options: ["Auto-detect", "Comma (,)", "Semicolon (;)", "Tab (\\t)"],
      defaultValue: "Auto-detect"
    }
  ],
  "Format JSON": [
    {
      id: "space",
      label: "Tab Spacing size",
      type: "select",
      options: ["2 Spaces", "4 Spaces", "Tabs"],
      defaultValue: "2 Spaces"
    }
  ],
  "Convert to PDF": [
    {
      id: "orientation",
      label: "Page Orientation",
      type: "select",
      options: ["Portrait", "Landscape"],
      defaultValue: "Portrait"
    },
    {
      id: "margins",
      label: "Page Margins",
      type: "select",
      options: ["None", "Standard (1 inch)"],
      defaultValue: "Standard (1 inch)"
    }
  ]
};

export function getToolOptions(toolName: string) {
  return toolOptionsConfig[toolName] || [];
}
