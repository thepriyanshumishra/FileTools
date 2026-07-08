"use client";

import React, { useState, useEffect, useRef } from "react";

interface ImageCropperProps {
  file: File & { preview?: string };
  onChange: (id: string, value: number) => void;
}

type AspectRatio = "free" | "1:1" | "16:9" | "4:3" | "9:16";

export function ImageCropper({ file, onChange }: ImageCropperProps) {
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });
  const [displaySize, setDisplaySize] = useState({ width: 0, height: 0 });
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("free");
  const [isReady, setIsReady] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Drag states
  const dragRef = useRef<{
    type: "move" | "tl" | "tr" | "bl" | "br" | "t" | "b" | "l" | "r" | null;
    startX: number;
    startY: number;
    startBox: { x: number; y: number; w: number; h: number };
  }>({
    type: null,
    startX: 0,
    startY: 0,
    startBox: { x: 0, y: 0, w: 0, h: 0 },
  });

  // Calculate default crop box size
  const initializeCrop = (imgWidth: number, imgHeight: number) => {
    const w = imgWidth * 0.8;
    const h = imgHeight * 0.8;
    const x = (imgWidth - w) / 2;
    const y = (imgHeight - h) / 2;
    const initialBox = { x, y, w, h };
    setCropBox(initialBox);
    updateParentCoordinates(initialBox, imgWidth, imgHeight);
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const naturalW = img.naturalWidth;
    const naturalH = img.naturalHeight;
    const displayW = img.clientWidth;
    const displayH = img.clientHeight;

    setNaturalSize({ width: naturalW, height: naturalH });
    setDisplaySize({ width: displayW, height: displayH });
    setIsReady(true);
    initializeCrop(displayW, displayH);
  };

  // Sync to parent component parameters
  const updateParentCoordinates = (
    box: { x: number; y: number; w: number; h: number },
    dispW: number,
    dispH: number
  ) => {
    if (!naturalSize.width || !dispW) return;
    const scaleX = naturalSize.width / dispW;
    const scaleY = naturalSize.height / dispH;

    const x = Math.round(box.x * scaleX);
    const y = Math.round(box.y * scaleY);
    const w = Math.round(box.w * scaleX);
    const h = Math.round(box.h * scaleY);

    onChange("x", Math.max(0, x));
    onChange("y", Math.max(0, y));
    onChange("width", Math.max(1, w));
    onChange("height", Math.max(1, h));
  };

  // Resize when aspect ratio selection changes
  useEffect(() => {
    if (!isReady || displaySize.width === 0) return;

    let { w, h, x, y } = cropBox;
    if (aspectRatio === "1:1") {
      const size = Math.min(w, h);
      w = size;
      h = size;
    } else if (aspectRatio === "16:9") {
      w = Math.min(displaySize.width - x, h * (16 / 9));
      h = w * (9 / 16);
    } else if (aspectRatio === "4:3") {
      w = Math.min(displaySize.width - x, h * (4 / 3));
      h = w * (3 / 4);
    } else if (aspectRatio === "9:16") {
      h = Math.min(displaySize.height - y, w * (16 / 9));
      w = h * (9 / 16);
    }

    const newBox = {
      x: Math.min(x, displaySize.width - w),
      y: Math.min(y, displaySize.height - h),
      w,
      h,
    };
    setCropBox(newBox);
    updateParentCoordinates(newBox, displaySize.width, displaySize.height);
  }, [aspectRatio]);

  // Handle drag gestures
  const startDrag = (
    e: React.MouseEvent | React.TouchEvent,
    type: typeof dragRef.current.type
  ) => {
    e.preventDefault();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    dragRef.current = {
      type,
      startX: clientX,
      startY: clientY,
      startBox: { ...cropBox },
    };

    document.addEventListener("mousemove", onDragging);
    document.addEventListener("mouseup", stopDrag);
    document.addEventListener("touchmove", onDragging, { passive: false });
    document.addEventListener("touchend", stopDrag);
  };

  const onDragging = (e: MouseEvent | TouchEvent) => {
    const drag = dragRef.current;
    if (!drag.type || !containerRef.current) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const dx = clientX - drag.startX;
    const dy = clientY - drag.startY;

    const dw = displaySize.width;
    const dh = displaySize.height;
    let { x, y, w, h } = drag.startBox;

    if (drag.type === "move") {
      x = Math.max(0, Math.min(dw - w, x + dx));
      y = Math.max(0, Math.min(dh - h, y + dy));
    } else {
      // Handles Resizing
      if (drag.type.includes("r")) {
        w = Math.max(20, Math.min(dw - x, w + dx));
      }
      if (drag.type.includes("b")) {
        h = Math.max(20, Math.min(dh - y, h + dy));
      }
      if (drag.type.includes("l")) {
        const potentialW = w - dx;
        if (potentialW >= 20 && x + dx >= 0) {
          x += dx;
          w = potentialW;
        }
      }
      if (drag.type.includes("t")) {
        const potentialH = h - dy;
        if (potentialH >= 20 && y + dy >= 0) {
          y += dy;
          h = potentialH;
        }
      }

      // Enforce aspect ratios
      if (aspectRatio === "1:1") {
        const size = Math.min(w, h);
        if (drag.type.includes("r") || drag.type.includes("b")) {
          w = size;
          h = size;
        } else {
          x += w - size;
          y += h - size;
          w = size;
          h = size;
        }
      } else if (aspectRatio !== "free") {
        const ratio = aspectRatio === "16:9" ? 16 / 9 : aspectRatio === "4:3" ? 4 / 3 : 9 / 16;
        if (drag.type === "r" || drag.type === "b" || drag.type === "br") {
          h = w / ratio;
        } else {
          w = h * ratio;
        }
      }
    }

    const nextBox = { x, y, w, h };
    setCropBox(nextBox);
    updateParentCoordinates(nextBox, dw, dh);
  };

  const stopDrag = () => {
    dragRef.current.type = null;
    document.removeEventListener("mousemove", onDragging);
    document.removeEventListener("mouseup", stopDrag);
    document.removeEventListener("touchmove", onDragging);
    document.removeEventListener("touchend", stopDrag);
  };

  useEffect(() => {
    return () => stopDrag();
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Aspect Ratio Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="text-sm font-semibold text-zinc-500 mr-2">Aspect Ratio:</span>
        {(["free", "1:1", "16:9", "4:3", "9:16"] as AspectRatio[]).map((ratio) => (
          <button
            key={ratio}
            onClick={() => setAspectRatio(ratio)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
              aspectRatio === ratio
                ? "bg-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105"
                : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {ratio}
          </button>
        ))}
      </div>

      {/* Editor Main Canvas Container */}
      <div
        ref={containerRef}
        className="relative bg-zinc-950/20 dark:bg-zinc-950/60 rounded-xl overflow-hidden shadow-inner flex items-center justify-center max-w-full"
        style={{ minHeight: "200px" }}
      >
        {file.preview ? (
          <img
            ref={imageRef}
            src={file.preview}
            alt="Crop Selection"
            onLoad={handleImageLoad}
            className="max-h-[50vh] object-contain select-none pointer-events-none rounded-xl"
          />
        ) : (
          <div className="text-sm text-zinc-400">Loading Preview...</div>
        )}

        {isReady && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* The Crop Visual Mask (using giant box shadow trick) */}
            <div
              className="absolute border border-dashed border-purple-500 bg-transparent shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] cursor-move pointer-events-auto transition-[border-color] hover:border-purple-400"
              style={{
                left: `${cropBox.x}px`,
                top: `${cropBox.y}px`,
                width: `${cropBox.w}px`,
                height: `${cropBox.h}px`,
              }}
              onMouseDown={(e) => startDrag(e, "move")}
              onTouchStart={(e) => startDrag(e, "move")}
            >
              {/* Corner Handles */}
              <div
                className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-purple-600 rounded-full cursor-nwse-resize shadow-md"
                onMouseDown={(e) => { e.stopPropagation(); startDrag(e, "tl"); }}
                onTouchStart={(e) => { e.stopPropagation(); startDrag(e, "tl"); }}
              />
              <div
                className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-purple-600 rounded-full cursor-nesw-resize shadow-md"
                onMouseDown={(e) => { e.stopPropagation(); startDrag(e, "tr"); }}
                onTouchStart={(e) => { e.stopPropagation(); startDrag(e, "tr"); }}
              />
              <div
                className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-purple-600 rounded-full cursor-nesw-resize shadow-md"
                onMouseDown={(e) => { e.stopPropagation(); startDrag(e, "bl"); }}
                onTouchStart={(e) => { e.stopPropagation(); startDrag(e, "bl"); }}
              />
              <div
                className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-purple-600 rounded-full cursor-nwse-resize shadow-md"
                onMouseDown={(e) => { e.stopPropagation(); startDrag(e, "br"); }}
                onTouchStart={(e) => { e.stopPropagation(); startDrag(e, "br"); }}
              />

              {/* Edge Handles */}
              <div
                className="absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize hover:bg-purple-400/50"
                onMouseDown={(e) => { e.stopPropagation(); startDrag(e, "l"); }}
                onTouchStart={(e) => { e.stopPropagation(); startDrag(e, "l"); }}
              />
              <div
                className="absolute top-0 bottom-0 right-0 w-1 cursor-ew-resize hover:bg-purple-400/50"
                onMouseDown={(e) => { e.stopPropagation(); startDrag(e, "r"); }}
                onTouchStart={(e) => { e.stopPropagation(); startDrag(e, "r"); }}
              />
              <div
                className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-purple-400/50"
                onMouseDown={(e) => { e.stopPropagation(); startDrag(e, "t"); }}
                onTouchStart={(e) => { e.stopPropagation(); startDrag(e, "t"); }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-purple-400/50"
                onMouseDown={(e) => { e.stopPropagation(); startDrag(e, "b"); }}
                onTouchStart={(e) => { e.stopPropagation(); startDrag(e, "b"); }}
              />
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 px-4 py-2 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800">
        💡 Drag the box to move it, or drag the edges and corner dots to resize it.
      </p>
    </div>
  );
}
