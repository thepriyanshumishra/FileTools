export const toolOptionsConfig: Record<string, any[]> = {
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
  ]
};

export function getToolOptions(toolName: string) {
  return toolOptionsConfig[toolName] || [];
}
