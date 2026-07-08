"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  PaintBrushIcon,
  DocumentTextIcon,
  ScissorsIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  ArrowPathIcon,
  PhotoIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon as TrashIconSolid
} from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import { useHistoryStore } from "@/lib/store/history";
import { saveDraftData, getDraftData } from "@/lib/utils/db";
import { LogoIcon } from "@/components/ui/logo-icon";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useFileTransferStore } from "@/lib/store/file-transfer";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#ffffff", "#000000", "#e2e8f0", "#ef4444", "#f97316", "#f59e0b",
  "#10b981", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899"
];

const FONTS = ["Inter", "Georgia", "Courier New", "Impact", "Comic Sans MS"];

interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  font: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  shadow: boolean;
  strokeWidth: number;
  strokeColor: string;
}

interface DrawingPath {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
}

interface EditorState {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  sepia: number;
  grayscale: number;
  hueRotate: number;
  presetFilter: string;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  texts: TextLayer[];
  drawings: DrawingPath[];
  imageSrc: string;
}

function PhotoSuiteContent() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const searchParams = useSearchParams();
  const { addToHistory, history: storeHistory } = useHistoryStore();
  const [activeDraftId, setActiveDraftId] = useState<string>("");

  // File Management
  const [imageSrc, setImageSrc] = useState<string>("");
  const [imageName, setImageName] = useState<string>("");
  const { pendingFiles, clearPendingFiles } = useFileTransferStore();

  // Panels & Views
  const [activeTool, setActiveTool] = useState<"adjust" | "filter" | "crop" | "text" | "draw">("adjust");
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(true);
  const [exportOpen, setExportOpen] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(100);

  // 1. Adjustment States
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [saturation, setSaturation] = useState<number>(100);
  const [blur, setBlur] = useState<number>(0);
  const [sepia, setSepia] = useState<number>(0);
  const [grayscale, setGrayscale] = useState<number>(0);
  const [hueRotate, setHueRotate] = useState<number>(0);

  // 2. Preset Filter State
  const [presetFilter, setPresetFilter] = useState<string>("none");

  // 3. Transform States
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // 4. Text Annotation States
  const [texts, setTexts] = useState<TextLayer[]>([]);
  const [activeTextId, setActiveTextId] = useState<string | null>(null);
  const [textColor, setTextColor] = useState<string>("#ffffff");
  const [textSize, setSize] = useState<number>(32);
  const [textFont, setFont] = useState<string>("Inter");
  const [textBold, setTextBold] = useState<boolean>(false);
  const [textItalic, setTextItalic] = useState<boolean>(false);
  const [textUnderline, setTextUnderline] = useState<boolean>(false);
  const [textShadow, setTextShadow] = useState<boolean>(false);
  const [textStroke, setTextStroke] = useState<number>(0);
  const [textStrokeColor, setTextStrokeColor] = useState<string>("#000000");
  const [textValue, setTextValue] = useState<string>("Double Click to Edit");

  // 5. Drawing States
  const [drawings, setDrawings] = useState<DrawingPath[]>([]);
  const [brushColor, setBrushColor] = useState<string>("#8b5cf6");
  const [brushWidth, setBrushWidth] = useState<number>(8);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // 6. Crop Box Overlay States
  const [cropActive, setCropActive] = useState<boolean>(false);
  const [cropBox, setCropBox] = useState({ x: 15, y: 15, w: 70, h: 70 }); // percentage
  const [cropAspectRatio, setCropAspectRatio] = useState<string>("free");

  // History state management (Undo/Redo)
  const [history, setHistory] = useState<EditorState[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Export properties
  const [exportFormat, setExportFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [exportQuality, setExportQuality] = useState<number>(90);
  const [exportScale, setExportScale] = useState<number>(1);
  const [processing, setProcessing] = useState<boolean>(false);

  // Text dragging state variables
  const [isDraggingText, setIsDraggingText] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Fits image zoom percentage relative to the screen bounds on load
  const fitImageToWorkspace = (imgWidth: number, imgHeight: number) => {
    // Left sidebar + drawer size: ~352px. Canvas padding: ~100px
    const drawerOffset = isPanelOpen ? 370 : 90;
    const maxW = window.innerWidth - drawerOffset - 80;
    const maxH = window.innerHeight - 200; // Header + Zoom Controls + Paddings

    const scaleX = maxW / imgWidth;
    const scaleY = maxH / imgHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Fit inside bounds (max 100% default)

    setZoom(Math.max(10, Math.floor(scale * 100)));
  };

  // Handle incoming drops from Home Page via Zustand
  useEffect(() => {
    if (pendingFiles.length > 0) {
      const file = pendingFiles[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            loadImage(e.target.result as string, file.name);
          }
        };
        reader.readAsDataURL(file);
      }
      clearPendingFiles();
    }
  }, [pendingFiles]);

  // Load existing draft from query parameters on mount
  useEffect(() => {
    const loadDraft = async () => {
      const draftId = searchParams?.get("draftId");
      if (draftId) {
        const draft = await getDraftData(draftId);
        if (draft) {
          setActiveDraftId(draftId);
          setImageSrc(draft.base64Data);

          const s = draft.editorState;
          if (s) {
            setBrightness(s.brightness ?? 100);
            setContrast(s.contrast ?? 100);
            setSaturation(s.saturation ?? 100);
            setBlur(s.blur ?? 0);
            setSepia(s.sepia ?? 0);
            setGrayscale(s.grayscale ?? 0);
            setHueRotate(s.hueRotate ?? 0);
            setPresetFilter(s.presetFilter ?? "none");
            setRotation(s.rotation ?? 0);
            setFlipH(s.flipH ?? false);
            setFlipV(s.flipV ?? false);
            setTexts(s.texts ?? []);
            setDrawings(s.drawings ?? []);
          }

          // Restore file name and setup base history
          const matchedItem = storeHistory.find((h) => h.id === draftId);
          if (matchedItem) {
            setImageName(matchedItem.fileName);
          }

          const initialState: EditorState = {
            brightness: s?.brightness ?? 100,
            contrast: s?.contrast ?? 100,
            saturation: s?.saturation ?? 100,
            blur: s?.blur ?? 0,
            sepia: s?.sepia ?? 0,
            grayscale: s?.grayscale ?? 0,
            hueRotate: s?.hueRotate ?? 0,
            presetFilter: s?.presetFilter ?? "none",
            rotation: s?.rotation ?? 0,
            flipH: s?.flipH ?? false,
            flipV: s?.flipV ?? false,
            texts: s?.texts ?? [],
            drawings: s?.drawings ?? [],
            imageSrc: draft.base64Data
          };

          setHistory([initialState]);
          setHistoryIndex(0);
        }
      }
    };
    loadDraft();
  }, [searchParams, storeHistory]);

  // Main Image Loader
  const loadImage = (src: string, name: string) => {
    setImageSrc(src);
    setImageName(name);

    // Reset parameters
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setBlur(0);
    setSepia(0);
    setGrayscale(0);
    setHueRotate(0);
    setPresetFilter("none");
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setTexts([]);
    setDrawings([]);
    setActiveTextId(null);
    setCropActive(false);

    // Generate active draft ID for session saving
    const draftId = Math.random().toString(36).substring(7);
    setActiveDraftId(draftId);

    const ext = (name.split(".").pop() || "png").toLowerCase();
    addToHistory({
      id: draftId,
      fileName: name,
      fileSize: Math.floor(src.length * 0.75), // approximate byte size from base64
      fileType: ext,
      toolName: "PhotoSuite",
      status: "draft"
    });

    const initialEditorState = {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      sepia: 0,
      grayscale: 0,
      hueRotate: 0,
      presetFilter: "none",
      rotation: 0,
      flipH: false,
      flipV: false,
      texts: [],
      drawings: []
    };

    saveDraftData(draftId, src, initialEditorState).catch(console.error);

    const img = new Image();
    img.onload = () => {
      fitImageToWorkspace(img.naturalWidth, img.naturalHeight);
    };
    img.src = src;

    const initialState: EditorState = {
      ...initialEditorState,
      imageSrc: src
    };

    setHistory([initialState]);
    setHistoryIndex(0);
  };

  // Push state snapshot to the Undo stack
  const captureHistory = useCallback((override?: Partial<EditorState>) => {
    if (!imageSrc) return;
    const currentState: EditorState = {
      brightness,
      contrast,
      saturation,
      blur,
      sepia,
      grayscale,
      hueRotate,
      presetFilter,
      rotation,
      flipH,
      flipV,
      texts,
      drawings,
      imageSrc,
      ...override
    };

    const nextHistory = history.slice(0, historyIndex + 1);
    setHistory([...nextHistory, currentState]);
    setHistoryIndex(nextHistory.length);

    if (activeDraftId) {
      saveDraftData(activeDraftId, currentState.imageSrc, {
        brightness: currentState.brightness,
        contrast: currentState.contrast,
        saturation: currentState.saturation,
        blur: currentState.blur,
        sepia: currentState.sepia,
        grayscale: currentState.grayscale,
        hueRotate: currentState.hueRotate,
        presetFilter: currentState.presetFilter,
        rotation: currentState.rotation,
        flipH: currentState.flipH,
        flipV: currentState.flipV,
        texts: currentState.texts,
        drawings: currentState.drawings,
      }).catch(console.error);

      addToHistory({
        id: activeDraftId,
        fileName: imageName || "untitled.png",
        fileSize: Math.floor(currentState.imageSrc.length * 0.75),
        fileType: (imageName.split(".").pop() || "png").toLowerCase(),
        toolName: "PhotoSuite",
        status: "draft"
      });
    }
  }, [brightness, contrast, saturation, blur, sepia, grayscale, hueRotate, presetFilter, rotation, flipH, flipV, texts, drawings, imageSrc, history, historyIndex, activeDraftId, imageName, addToHistory]);

  const applyHistoryState = (state: EditorState) => {
    setBrightness(state.brightness);
    setContrast(state.contrast);
    setSaturation(state.saturation);
    setBlur(state.blur);
    setSepia(state.sepia);
    setGrayscale(state.grayscale);
    setHueRotate(state.hueRotate);
    setPresetFilter(state.presetFilter);
    setRotation(state.rotation);
    setFlipH(state.flipH);
    setFlipV(state.flipV);
    setTexts(state.texts);
    setDrawings(state.drawings);
    setImageSrc(state.imageSrc);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      applyHistoryState(history[prevIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      applyHistoryState(history[nextIdx]);
    }
  };

  // Image load dropzone setup
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          loadImage(e.target.result as string, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false
  });

  // Calculate coordinates relative to canvas internal pixels
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    let clientX = 0;
    let clientY = 0;
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  // 2D Canvas Redraw Loop
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isRotated = rotation === 90 || rotation === 270;
    canvas.width = isRotated ? img.naturalHeight : img.naturalWidth;
    canvas.height = isRotated ? img.naturalWidth : img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // 1. Draw transformed background image
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.translate(-img.naturalWidth / 2, -img.naturalHeight / 2);

    let filterStr = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px) sepia(${sepia}%) grayscale(${grayscale}%) hue-rotate(${hueRotate}deg)`;
    if (presetFilter === "vintage") filterStr += " sepia(40%) contrast(110%) saturate(85%)";
    else if (presetFilter === "noir") filterStr += " grayscale(100%) contrast(125%)";
    else if (presetFilter === "warm") filterStr += " sepia(25%) saturate(115%) hue-rotate(-12deg)";
    else if (presetFilter === "cool") filterStr += " saturate(115%) hue-rotate(15deg)";
    else if (presetFilter === "fade") filterStr += " brightness(110%) contrast(90%) saturate(80%)";

    ctx.filter = filterStr;
    ctx.drawImage(img, 0, 0);
    ctx.restore();

    // 2. Draw annotations on top
    // Brush strokes
    drawings.forEach((path) => {
      if (path.points.length === 0) return;
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    });

    // Text layers
    texts.forEach((txt) => {
      ctx.save();
      
      let fontStyle = "";
      if (txt.italic) fontStyle += "italic ";
      if (txt.bold) fontStyle += "bold ";
      ctx.font = `${fontStyle}${txt.size}px ${txt.font}`;
      ctx.textBaseline = "top";

      // Shadow effect
      if (txt.shadow) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 4;
        ctx.shadowOffsetY = 4;
      }

      // Stroke Outline (Effects layer)
      if (txt.strokeWidth > 0) {
        ctx.strokeStyle = txt.strokeColor;
        ctx.lineWidth = txt.strokeWidth;
        ctx.lineJoin = "round";
        ctx.strokeText(txt.text, txt.x, txt.y);
      }

      ctx.fillStyle = txt.color;
      ctx.fillText(txt.text, txt.x, txt.y);

      // Underline style (Standard drawing)
      if (txt.underline) {
        const textWidth = ctx.measureText(txt.text).width;
        ctx.beginPath();
        ctx.strokeStyle = txt.color;
        ctx.lineWidth = Math.max(1.5, txt.size / 16);
        ctx.moveTo(txt.x, txt.y + txt.size + 4);
        ctx.lineTo(txt.x + textWidth, txt.y + txt.size + 4);
        ctx.stroke();
      }

      // Hover selection dotted border
      if (txt.id === activeTextId && activeTool === "text") {
        const textWidth = ctx.measureText(txt.text).width;
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = "#8b5cf6";
        ctx.lineWidth = Math.max(2, txt.size / 15);
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(txt.x - 8, txt.y - 8, textWidth + 16, txt.size + 16);
      }
      ctx.restore();
    });
  }, [brightness, contrast, saturation, blur, sepia, grayscale, hueRotate, presetFilter, rotation, flipH, flipV, drawings, texts, activeTextId, activeTool]);

  // Trigger redraw on source image updates
  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        redrawCanvas();
      };
      img.src = imageSrc;
    }
  }, [imageSrc, redrawCanvas]);

  // Click handler for left toolbar buttons (Canva style slideout drawer)
  const handleToolClick = (toolId: typeof activeTool) => {
    if (activeTool === toolId && isPanelOpen) {
      setIsPanelOpen(false);
    } else {
      setActiveTool(toolId);
      setIsPanelOpen(true);
      if (toolId !== "crop") {
        setCropActive(false);
      }
    }
  };

  // Add a text layer
  const handleAddText = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newText: TextLayer = {
      id: Math.random().toString(36).substring(7),
      text: "Double Click to Edit",
      x: canvas.width / 2 - 120,
      y: canvas.height / 2 - 20,
      size: textSize,
      color: textColor,
      font: textFont,
      bold: textBold,
      italic: textItalic,
      underline: textUnderline,
      shadow: textShadow,
      strokeWidth: textStroke,
      strokeColor: textStrokeColor
    };

    const nextTexts = [...texts, newText];
    setTexts(nextTexts);
    setActiveTextId(newText.id);
    setTextValue(newText.text);
    captureHistory({ texts: nextTexts });
  };

  // Visual crop application
  const handleApplyCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pxX = (cropBox.x / 100) * canvas.width;
    const pxY = (cropBox.y / 100) * canvas.height;
    const pxW = (cropBox.w / 100) * canvas.width;
    const pxH = (cropBox.h / 100) * canvas.height;

    const offscreen = document.createElement("canvas");
    offscreen.width = pxW;
    offscreen.height = pxH;
    const oCtx = offscreen.getContext("2d");

    if (oCtx) {
      oCtx.drawImage(canvas, pxX, pxY, pxW, pxH, 0, 0, pxW, pxH);
      const croppedDataUrl = offscreen.toDataURL("image/png");

      setImageSrc(croppedDataUrl);
      setCropActive(false);

      // Reset transformations
      setRotation(0);
      setFlipH(false);
      setFlipV(false);
      setTexts([]);
      setDrawings([]);
      setActiveTextId(null);

      const croppedState: EditorState = {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        sepia: 0,
        grayscale: 0,
        hueRotate: 0,
        presetFilter: "none",
        rotation: 0,
        flipH: false,
        flipV: false,
        texts: [],
        drawings: [],
        imageSrc: croppedDataUrl
      };

      const nextHistory = history.slice(0, historyIndex + 1);
      setHistory([...nextHistory, croppedState]);
      setHistoryIndex(nextHistory.length);
    }
  };

  // Mouse down router (painting brush / drag text layers)
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);

    if (activeTool === "draw") {
      setIsDrawing(true);
      const newPath: DrawingPath = {
        id: Math.random().toString(36).substring(7),
        points: [coords],
        color: brushColor,
        width: brushWidth
      };
      setDrawings([...drawings, newPath]);
      return;
    }

    if (activeTool === "text") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      let foundText: TextLayer | null = null;
      for (let i = texts.length - 1; i >= 0; i--) {
        const txt = texts[i];
        let fontStyle = "";
        if (txt.italic) fontStyle += "italic ";
        if (txt.bold) fontStyle += "bold ";
        ctx.font = `${fontStyle}${txt.size}px ${txt.font}`;
        const width = ctx.measureText(txt.text).width;
        if (
          coords.x >= txt.x - 8 &&
          coords.x <= txt.x + width + 8 &&
          coords.y >= txt.y - 8 &&
          coords.y <= txt.y + txt.size + 8
        ) {
          foundText = txt;
          break;
        }
      }

      if (foundText) {
        setActiveTextId(foundText.id);
        setTextValue(foundText.text);
        setTextColor(foundText.color);
        setSize(foundText.size);
        setFont(foundText.font);
        setTextBold(foundText.bold);
        setTextItalic(foundText.italic);
        setTextUnderline(foundText.underline);
        setTextShadow(foundText.shadow);
        setTextStroke(foundText.strokeWidth);
        setTextStrokeColor(foundText.strokeColor);

        setIsDraggingText(true);
        setDragOffset({
          x: coords.x - foundText.x,
          y: coords.y - foundText.y
        });
      } else {
        setActiveTextId(null);
      }
    }
  };

  // Dragging movement compiler
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);

    if (isDrawing && activeTool === "draw" && drawings.length > 0) {
      const updatedDrawings = [...drawings];
      const activePath = { ...updatedDrawings[updatedDrawings.length - 1] };
      activePath.points = [...activePath.points, coords];
      updatedDrawings[updatedDrawings.length - 1] = activePath;
      setDrawings(updatedDrawings);
      redrawCanvas();
      return;
    }

    if (isDraggingText && activeTextId && activeTool === "text") {
      const updatedTexts = texts.map((txt) => {
        if (txt.id === activeTextId) {
          return {
            ...txt,
            x: coords.x - dragOffset.x,
            y: coords.y - dragOffset.y
          };
        }
        return txt;
      });
      setTexts(updatedTexts);
      redrawCanvas();
    }
  };

  const handleCanvasMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      captureHistory({ drawings });
    }
    if (isDraggingText) {
      setIsDraggingText(false);
      captureHistory({ texts });
    }
  };

  const handleUpdateTextProperties = (updates: Partial<TextLayer>) => {
    if (!activeTextId) return;
    const nextTexts = texts.map((txt) => {
      if (txt.id === activeTextId) {
        return { ...txt, ...updates };
      }
      return txt;
    });
    setTexts(nextTexts);
    captureHistory({ texts: nextTexts });
  };

  const handleDeleteText = () => {
    if (!activeTextId) return;
    const nextTexts = texts.filter((t) => t.id !== activeTextId);
    setTexts(nextTexts);
    setActiveTextId(null);
    captureHistory({ texts: nextTexts });
  };

  // Text Layers Z-indexing position reordering
  const handleBringToFront = () => {
    if (!activeTextId) return;
    const target = texts.find((t) => t.id === activeTextId);
    if (!target) return;
    const filtered = texts.filter((t) => t.id !== activeTextId);
    const next = [...filtered, target];
    setTexts(next);
    captureHistory({ texts: next });
  };

  const handleSendToBack = () => {
    if (!activeTextId) return;
    const target = texts.find((t) => t.id === activeTextId);
    if (!target) return;
    const filtered = texts.filter((t) => t.id !== activeTextId);
    const next = [target, ...filtered];
    setTexts(next);
    captureHistory({ texts: next });
  };

  // Compile export and download
  const handleExport = () => {
    const canvas = canvasRef.current;
    if (!canvas || processing) return;

    setProcessing(true);
    setExportOpen(false);

    try {
      let exportCanvas = canvas;
      if (exportScale !== 1) {
        exportCanvas = document.createElement("canvas");
        exportCanvas.width = canvas.width * exportScale;
        exportCanvas.height = canvas.height * exportScale;
        const eCtx = exportCanvas.getContext("2d");
        if (eCtx) {
          eCtx.drawImage(canvas, 0, 0, exportCanvas.width, exportCanvas.height);
        }
      }

      let mime = "image/png";
      let extension = "png";
      if (exportFormat === "jpeg") {
        mime = "image/jpeg";
        extension = "jpg";
      } else if (exportFormat === "webp") {
        mime = "image/webp";
        extension = "webp";
      }

      const quality = exportFormat === "png" ? undefined : exportQuality / 100;
      const dataUrl = exportCanvas.toDataURL(mime, quality);

      const link = document.createElement("a");
      const baseName = imageName.substring(0, imageName.lastIndexOf(".")) || "photosuite_output";
      link.download = `${baseName}_edited.${extension}`;
      link.href = dataUrl;
      link.click();

      if (activeDraftId) {
        addToHistory({
          id: activeDraftId,
          fileName: imageName || "untitled.png",
          fileSize: Math.floor(dataUrl.length * 0.75),
          fileType: extension,
          toolName: "PhotoSuite",
          status: "exported"
        });
      }
    } catch (err) {
      console.error("Failed to compile image export:", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="h-screen w-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col font-sans overflow-hidden select-none transition-colors duration-300">
      {/* 1. UNIFIED HEADER BAR (Navbar & download options combined) */}
      <header className="h-16 flex-shrink-0 border-b border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex items-center justify-between px-6 z-20 transition-colors">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg group mr-2">
            <div className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 transition-transform duration-300">
              <LogoIcon className="h-4.5 w-4.5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent font-black hidden sm:inline">
              FileTools
            </span>
          </Link>
          <span className="text-zinc-200 dark:text-zinc-800">|</span>
          <input
            type="text"
            value={imageName ? imageName.substring(0, imageName.lastIndexOf(".")) : ""}
            onChange={(e) => setImageName(e.target.value + (imageName.substring(imageName.lastIndexOf(".")) || ".png"))}
            disabled={!imageSrc}
            placeholder="Untitled Image"
            className="bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900/50 focus:bg-white dark:focus:bg-zinc-900 border-none rounded-lg px-2.5 py-1 text-sm font-bold text-zinc-800 dark:text-zinc-200 max-w-[200px] focus:outline-none transition-all disabled:opacity-50"
          />
        </div>

        {/* Undo/Redo Center Controls */}
        {imageSrc && (
          <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900/50 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800/60">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Undo"
            >
              <ArrowUturnLeftIcon className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
              title="Redo"
            >
              <ArrowUturnRightIcon className="h-4.5 w-4.5" />
            </button>
          </div>
        )}

        {/* Right side download and theme toggle controls */}
        <div className="flex items-center gap-4">
          <ThemeToggle className="scale-75 origin-right" />
          
          {imageSrc ? (
            <div className="relative">
              <button
                onClick={() => setExportOpen(!exportOpen)}
                className="px-4.5 py-2 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-500/20 text-xs transition-all flex items-center gap-1.5 select-none"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Download
              </button>

              <AnimatePresence>
                {exportOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-64 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-2xl p-5 shadow-2xl space-y-4"
                  >
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-850 pb-2">
                      File Export Options
                    </h3>
                    <div className="space-y-3 text-left">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Format</label>
                        <select
                          value={exportFormat}
                          onChange={(e) => setExportFormat(e.target.value as any)}
                          className="w-full px-2.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                        >
                          <option value="png">PNG (Lossless)</option>
                          <option value="jpeg">JPEG (Compressed)</option>
                          <option value="webp">WebP (Modern)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Resolution</label>
                        <select
                          value={exportScale}
                          onChange={(e) => setExportScale(parseFloat(e.target.value))}
                          className="w-full px-2.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-800 dark:text-zinc-200 focus:outline-none"
                        >
                          <option value="1">1x (Original)</option>
                          <option value="1.5">1.5x (Medium)</option>
                          <option value="2">2x (Retina HD)</option>
                        </select>
                      </div>

                      {exportFormat !== "png" && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                            <span>Quality</span>
                            <span className="text-purple-600 dark:text-purple-400">{exportQuality}%</span>
                          </div>
                          <input
                            type="range"
                            min={10}
                            max={100}
                            value={exportQuality}
                            onChange={(e) => setExportQuality(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleExport}
                      disabled={processing}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
                    >
                      {processing ? "Compiling..." : "Export Image"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <span className="text-xs text-zinc-400 dark:text-zinc-650 font-semibold select-none">No active file</span>
          )}
        </div>
      </header>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex overflow-hidden relative">
        {!imageSrc ? (
          /* EMPTY STATE DROPZONE */
          <div className="flex-1 flex items-center justify-center p-8 relative z-10 bg-zinc-50 dark:bg-zinc-950/20">
            <div
              {...getRootProps()}
              className={cn(
                "w-full max-w-2xl border-2 border-dashed rounded-3xl p-16 text-center cursor-pointer transition-all bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800/80 shadow-xl",
                isDragActive
                  ? "border-purple-500 bg-purple-500/5 scale-102"
                  : "hover:border-purple-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-900/10"
              )}
            >
              <input {...getInputProps()} />
              <div className="p-4 bg-purple-500/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
                <PhotoIcon className="h-10 w-10 text-purple-500" />
              </div>
              <h2 className="text-2xl font-black mb-2 text-zinc-800 dark:text-zinc-100">Import Image to PhotoSuite</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-md mx-auto mb-4 leading-relaxed">
                Drag & drop any JPEG, PNG, or WebP picture here to unlock advanced sliders, brush drawing, and annotation overlays.
              </p>
              <p className="text-xs text-zinc-400 dark:text-zinc-650">Supports files up to 50MB. Processes 100% locally in memory.</p>
            </div>
          </div>
        ) : (
          /* CANVAS ACTIVE STATE WORKSPACE */
          <>
            {/* COLUMN 1: LEFT TOOLBAR (Narrow vertical strip) */}
            <div className="w-[72px] flex-shrink-0 border-r border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 flex flex-col items-center py-4 gap-2 z-10 transition-colors">
              {[
                { id: "adjust", icon: AdjustmentsHorizontalIcon, label: "Adjust" },
                { id: "filter", icon: SparklesIcon, label: "Filters" },
                { id: "crop", icon: ScissorsIcon, label: "Crop" },
                { id: "text", icon: DocumentTextIcon, label: "Text" },
                { id: "draw", icon: PaintBrushIcon, label: "Draw" }
              ].map((tool) => {
                const isActive = activeTool === tool.id && isPanelOpen;
                return (
                  <button
                    key={tool.id}
                    onClick={() => handleToolClick(tool.id as any)}
                    className={cn(
                      "flex flex-col items-center justify-center p-2.5 rounded-xl transition-all w-14 h-14 gap-1 select-none",
                      isActive
                        ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 dark:text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
                    )}
                  >
                    <tool.icon className="h-5 w-5" />
                    <span className="text-[9px] tracking-wider uppercase font-bold">{tool.label}</span>
                  </button>
                );
              })}
            </div>

            {/* COLUMN 2: SLIDE-OUT PANEL DRAWER */}
            <AnimatePresence>
              {isPanelOpen && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 280, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="h-full flex-shrink-0 border-r border-zinc-200 dark:border-zinc-900 bg-zinc-50/70 dark:bg-zinc-900/30 backdrop-blur-sm flex flex-col overflow-hidden z-10 transition-colors"
                >
                  <div className="p-5 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900">
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      {activeTool === "adjust" && "Fine Adjust"}
                      {activeTool === "filter" && "Preset Filters"}
                      {activeTool === "crop" && "Transforms"}
                      {activeTool === "text" && "Text Overlays"}
                      {activeTool === "draw" && "Paint Brush"}
                    </h3>
                    <button
                      onClick={() => setIsPanelOpen(false)}
                      className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-450 hover:text-zinc-800 dark:hover:text-zinc-200"
                      title="Collapse Panel"
                    >
                      <ChevronLeftIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* A. Adjust Tool Options */}
                    {activeTool === "adjust" && (
                      <div className="space-y-4 text-left">
                        {[
                          { label: "Brightness", val: brightness, set: setBrightness, min: 50, max: 150, unit: "%" },
                          { label: "Contrast", val: contrast, set: setContrast, min: 50, max: 150, unit: "%" },
                          { label: "Saturation", val: saturation, set: setSaturation, min: 0, max: 200, unit: "%" },
                          { label: "Grayscale", val: grayscale, set: setGrayscale, min: 0, max: 100, unit: "%" },
                          { label: "Sepia", val: sepia, set: setSepia, min: 0, max: 100, unit: "%" },
                          { label: "Blur Effect", val: blur, set: setBlur, min: 0, max: 15, unit: "px" },
                          { label: "Hue Rotation", val: hueRotate, set: setHueRotate, min: 0, max: 360, unit: "°" }
                        ].map((slider) => (
                          <div key={slider.label} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-zinc-500">
                              <span>{slider.label}</span>
                              <span className="text-purple-600 dark:text-purple-400 font-bold">{slider.val}{slider.unit}</span>
                            </div>
                            <input
                              type="range"
                              min={slider.min}
                              max={slider.max}
                              value={slider.val}
                              onChange={(e) => {
                                slider.set(parseInt(e.target.value));
                                captureHistory();
                              }}
                              className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* B. Preset Filters Options */}
                    {activeTool === "filter" && (
                      <div className="grid grid-cols-2 gap-2 text-left">
                        {[
                          { id: "none", label: "Normal" },
                          { id: "vintage", label: "Vintage" },
                          { id: "noir", label: "Noir" },
                          { id: "warm", label: "Warm Sunset" },
                          { id: "cool", label: "Cool Ice" },
                          { id: "fade", label: "Faded Film" }
                        ].map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => {
                              setPresetFilter(preset.id);
                              captureHistory({ presetFilter: preset.id });
                            }}
                            className={cn(
                              "py-3.5 px-3 rounded-xl text-[11px] font-bold border transition-all text-center flex flex-col items-center justify-center gap-1.5 select-none",
                              presetFilter === preset.id
                                ? "bg-purple-600/10 border-purple-500/50 text-purple-600 dark:text-purple-400"
                                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/40"
                            )}
                          >
                            <span className="text-lg">🎨</span>
                            <span>{preset.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* C. Crop & Transformations */}
                    {activeTool === "crop" && (
                      <div className="space-y-5 text-left">
                        <div className="space-y-2">
                          <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Quick Transforms</label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => {
                                const newRot = (rotation + 90) % 360;
                                setRotation(newRot);
                                captureHistory({ rotation: newRot });
                              }}
                              className="py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[10px] font-bold flex flex-col items-center gap-1 select-none"
                            >
                              <ArrowPathIcon className="h-4.5 w-4.5 text-purple-500" />
                              <span>Rotate 90°</span>
                            </button>
                            <button
                              onClick={() => {
                                setFlipH(!flipH);
                                captureHistory({ flipH: !flipH });
                              }}
                              className="py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[10px] font-bold flex flex-col items-center gap-1 select-none"
                            >
                              <span className="text-base text-purple-500">↔️</span>
                              <span>Flip H</span>
                            </button>
                            <button
                              onClick={() => {
                                setFlipV(!flipV);
                                captureHistory({ flipV: !flipV });
                              }}
                              className="py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[10px] font-bold flex flex-col items-center gap-1 select-none"
                            >
                              <span className="text-base text-purple-500">↕️</span>
                              <span>Flip V</span>
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-900">
                          <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Crop Viewport</label>
                          {!cropActive ? (
                            <button
                              onClick={() => {
                                setCropActive(true);
                                setCropBox({ x: 15, y: 15, w: 70, h: 70 });
                              }}
                              className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-900 hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-850 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm select-none"
                            >
                              <ScissorsIcon className="h-4 w-4 text-purple-400" />
                              Activate Crop Frame
                            </button>
                          ) : (
                            <div className="space-y-3">
                              <div className="grid grid-cols-2 gap-1.5">
                                {[
                                  { id: "free", label: "Free" },
                                  { id: "1:1", label: "1:1 Square" },
                                  { id: "16:9", label: "16:9 HD" },
                                  { id: "9:16", label: "9:16 Tall" }
                                ].map((ratio) => (
                                  <button
                                    key={ratio.id}
                                    onClick={() => {
                                      setCropAspectRatio(ratio.id);
                                      if (ratio.id === "1:1") {
                                        setCropBox({ ...cropBox, h: cropBox.w });
                                      } else if (ratio.id === "16:9") {
                                        setCropBox({ ...cropBox, h: cropBox.w * (9 / 16) });
                                      } else if (ratio.id === "9:16") {
                                        setCropBox({ ...cropBox, h: cropBox.w * (16 / 9) });
                                      }
                                    }}
                                    className={cn(
                                      "py-2 rounded-lg text-[10px] font-bold border select-none",
                                      cropAspectRatio === ratio.id
                                        ? "bg-purple-600/10 border-purple-500 text-purple-600 dark:text-purple-400"
                                        : "bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-500"
                                    )}
                                  >
                                    {ratio.label}
                                  </button>
                                ))}
                              </div>
                              
                              <div className="flex gap-2 pt-2">
                                <button
                                  onClick={handleApplyCrop}
                                  className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 font-bold text-xs"
                                >
                                  Apply Crop
                                </button>
                                <button
                                  onClick={() => setCropActive(false)}
                                  className="flex-1 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-400 rounded-lg hover:bg-zinc-300 font-bold text-xs"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* D. Text Annotations options */}
                    {activeTool === "text" && (
                      <div className="space-y-4 text-left">
                        <button
                          onClick={handleAddText}
                          className="w-full py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-500 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-purple-600/10 select-none"
                        >
                          <DocumentTextIcon className="h-4.5 w-4.5" />
                          Add Text Layer
                        </button>
                        
                        {activeTextId && (
                          <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-900">
                            <div className="space-y-1">
                              <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Edit Text Value</label>
                              <input
                                type="text"
                                value={textValue}
                                onChange={(e) => {
                                  setTextValue(e.target.value);
                                  handleUpdateTextProperties({ text: e.target.value });
                                }}
                                className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none text-xs text-zinc-850 dark:text-zinc-200"
                              />
                            </div>
                            <button
                              onClick={handleDeleteText}
                              className="w-full py-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/20 text-red-550 hover:bg-red-100 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 select-none"
                            >
                              <TrashIconSolid className="h-4 w-4" />
                              Delete Text Layer
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* E. Brush Painting settings */}
                    {activeTool === "draw" && (
                      <div className="space-y-4 text-left">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold text-zinc-500">
                            <span>Brush Size</span>
                            <span className="text-purple-600 dark:text-purple-400 font-bold">{brushWidth}px</span>
                          </div>
                          <input
                            type="range"
                            min={1}
                            max={50}
                            value={brushWidth}
                            onChange={(e) => setBrushWidth(parseInt(e.target.value))}
                            className="w-full h-1 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* COLUMN 3: CENTER VIEWPORT WORKSPACE CANVAS */}
            <div className="flex-grow flex flex-col items-center justify-center p-6 bg-zinc-100/50 dark:bg-zinc-950/40 relative overflow-hidden transition-colors">
              <div className="absolute inset-0 bg-transparent bg-radial-grid opacity-[0.05] dark:opacity-[0.08] pointer-events-none" />

              {/* 3.1 FLOATING CONTEXTUAL TOOLBAR (Canva-style options) */}
              <AnimatePresence>
                {((activeTool === "text" && activeTextId) || activeTool === "draw") && (
                  <motion.div
                    initial={{ opacity: 0, y: -15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.95 }}
                    className="absolute top-6 z-40 bg-white/95 dark:bg-zinc-900/95 shadow-2xl border border-zinc-200 dark:border-zinc-850 rounded-2xl px-5 py-3 flex items-center gap-4.5 backdrop-blur-md transition-colors"
                  >
                    {activeTool === "text" && activeTextId && (
                      <div className="flex items-center gap-3.5">
                        {/* Font Family selector */}
                        <select
                          value={textFont}
                          onChange={(e) => {
                            setFont(e.target.value);
                            handleUpdateTextProperties({ font: e.target.value });
                          }}
                          className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-bold focus:outline-none"
                        >
                          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>

                        {/* Font Size controls */}
                        <div className="flex items-center gap-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-0.5">
                          <button
                            onClick={() => {
                              const s = Math.max(12, textSize - 2);
                              setSize(s);
                              handleUpdateTextProperties({ size: s });
                            }}
                            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded"
                          >
                            <MinusIcon className="h-3.5 w-3.5" />
                          </button>
                          <span className="text-xs font-extrabold px-1 min-w-[20px] text-center">{textSize}</span>
                          <button
                            onClick={() => {
                              const s = Math.min(200, textSize + 2);
                              setSize(s);
                              handleUpdateTextProperties({ size: s });
                            }}
                            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded"
                          >
                            <PlusIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Formatting tags */}
                        <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-950 p-0.5">
                          <button
                            onClick={() => {
                              setTextBold(!textBold);
                              handleUpdateTextProperties({ bold: !textBold });
                            }}
                            className={cn(
                              "w-7 h-7 rounded text-xs font-black transition-all",
                              textBold ? "bg-purple-600 text-white" : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                            )}
                            title="Bold"
                          >
                            B
                          </button>
                          <button
                            onClick={() => {
                              setTextItalic(!textItalic);
                              handleUpdateTextProperties({ italic: !textItalic });
                            }}
                            className={cn(
                              "w-7 h-7 rounded text-xs italic font-semibold transition-all",
                              textItalic ? "bg-purple-600 text-white" : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                            )}
                            title="Italic"
                          >
                            I
                          </button>
                          <button
                            onClick={() => {
                              setTextUnderline(!textUnderline);
                              handleUpdateTextProperties({ underline: !textUnderline });
                            }}
                            className={cn(
                              "w-7 h-7 rounded text-xs underline font-semibold transition-all",
                              textUnderline ? "bg-purple-600 text-white" : "text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                            )}
                            title="Underline"
                          >
                            U
                          </button>
                        </div>

                        {/* Text Effects controls */}
                        <div className="flex items-center gap-1 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5 bg-zinc-50 dark:bg-zinc-950">
                          <button
                            onClick={() => {
                              setTextShadow(!textShadow);
                              handleUpdateTextProperties({ shadow: !textShadow });
                            }}
                            className={cn(
                              "px-2 py-1 text-[10px] font-bold rounded transition-all",
                              textShadow ? "bg-purple-600 text-white" : "text-zinc-500 hover:bg-zinc-250 dark:hover:bg-zinc-800"
                            )}
                            title="Drop Shadow Effect"
                          >
                            Shadow
                          </button>
                          <button
                            onClick={() => {
                              const nextStroke = textStroke === 0 ? 3 : 0;
                              setTextStroke(nextStroke);
                              handleUpdateTextProperties({ strokeWidth: nextStroke, strokeColor: textStrokeColor });
                            }}
                            className={cn(
                              "px-2 py-1 text-[10px] font-bold rounded transition-all",
                              textStroke > 0 ? "bg-purple-600 text-white" : "text-zinc-500 hover:bg-zinc-250 dark:hover:bg-zinc-800"
                            )}
                            title="Outline Border Stroke"
                          >
                            Stroke
                          </button>
                        </div>

                        {/* Layer alignment controls */}
                        <div className="flex items-center gap-1 border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5 bg-zinc-50 dark:bg-zinc-950">
                          <button
                            onClick={handleBringToFront}
                            className="px-2 py-1 text-[9px] font-bold text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded"
                            title="Bring layer to front"
                          >
                            Front
                          </button>
                          <button
                            onClick={handleSendToBack}
                            className="px-2 py-1 text-[9px] font-bold text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded"
                            title="Send layer to back"
                          >
                            Back
                          </button>
                        </div>

                        {/* Custom Color Spectrum Button + Swatches */}
                        <div className="flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-800 pl-3">
                          {/* Spectrum Input Picker */}
                          <label
                            className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 cursor-pointer flex items-center justify-center bg-gradient-to-tr from-red-500 via-green-500 to-blue-500 relative overflow-hidden transition-transform hover:scale-105 active:scale-95"
                            title="Custom Color"
                          >
                            <input
                              type="color"
                              value={textColor}
                              onChange={(e) => {
                                const c = e.target.value;
                                setTextColor(c);
                                handleUpdateTextProperties({ color: c });
                              }}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                          </label>
                          
                          {/* Large circular color swatches */}
                          <div className="flex items-center gap-1.5">
                            {PRESET_COLORS.slice(0, 5).map((color) => (
                              <button
                                key={color}
                                onClick={() => {
                                  setTextColor(color);
                                  handleUpdateTextProperties({ color });
                                }}
                                className={cn(
                                  "w-7 h-7 rounded-full border transition-all hover:scale-110 active:scale-95",
                                  textColor === color ? "scale-108 border-purple-500 ring-2 ring-purple-600/30" : "border-zinc-300 dark:border-zinc-800"
                                )}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTool === "draw" && (
                      <div className="flex items-center gap-3.5">
                        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider select-none">Paint Color:</span>
                        <div className="flex items-center gap-2">
                          <label
                            className="w-7 h-7 rounded-full border border-zinc-200 dark:border-zinc-700 cursor-pointer flex items-center justify-center bg-gradient-to-tr from-red-500 via-green-500 to-blue-500 relative overflow-hidden transition-transform hover:scale-105"
                            title="Custom Paint Color"
                          >
                            <input
                              type="color"
                              value={brushColor}
                              onChange={(e) => setBrushColor(e.target.value)}
                              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                          </label>

                          <div className="flex items-center gap-1.5">
                            {PRESET_COLORS.slice(0, 6).map((color) => (
                              <button
                                key={color}
                                onClick={() => setBrushColor(color)}
                                className={cn(
                                  "w-7 h-7 rounded-full border transition-all hover:scale-110",
                                  brushColor === color ? "scale-108 border-purple-500 ring-2 ring-purple-600/30" : "border-zinc-300 dark:border-zinc-800"
                                )}
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 3.2 CANVAS IMAGE WRAPPER (Fits perfectly within screen area with shadow, never overflows window) */}
              <div className="flex-1 w-full flex items-center justify-center p-4 overflow-hidden relative">
                <div 
                  className="relative max-w-full max-h-[70vh] flex items-center justify-center rounded-2xl shadow-2xl transition-all border border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-900 select-none z-10"
                  style={{ transform: `scale(${zoom / 100})` }}
                >
                  <canvas
                    ref={canvasRef}
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    className={cn(
                      "max-w-full max-h-[66vh] h-auto object-contain cursor-default touch-none",
                      activeTool === "draw" && "cursor-crosshair",
                      activeTool === "text" && "cursor-text"
                    )}
                  />

                  {/* Visual crop box frames */}
                  {activeTool === "crop" && cropActive && (
                    <div className="absolute inset-0 border-2 border-dashed border-purple-500 pointer-events-none select-none z-30">
                      <div 
                        className="absolute border-2 border-solid border-purple-500 bg-purple-500/5 shadow-2xl flex items-center justify-center"
                        style={{
                          left: `${cropBox.x}%`,
                          top: `${cropBox.y}%`,
                          width: `${cropBox.w}%`,
                          height: `${cropBox.h}%`
                        }}
                      >
                        <div className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-purple-600 rounded-full border-2 border-white pointer-events-auto cursor-nwse-resize" />
                        <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-purple-600 rounded-full border-2 border-white pointer-events-auto cursor-nesw-resize" />
                        <div className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-purple-600 rounded-full border-2 border-white pointer-events-auto cursor-nesw-resize" />
                        <div className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-purple-600 rounded-full border-2 border-white pointer-events-auto cursor-nwse-resize" />
                        
                        <span className="text-[9px] bg-purple-900/90 border border-purple-500/30 px-2 py-0.5 rounded text-white font-bold tracking-wider select-none uppercase">
                          Crop Area
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3.3 BOTTOM VIEWPORT CONTROL BAR */}
              <div className="mt-auto mb-3 flex items-center gap-3 bg-white dark:bg-zinc-950 px-6 py-2.5 rounded-full border border-zinc-200 dark:border-zinc-900 shadow-lg z-10 transition-colors">
                <button
                  onClick={() => setZoom(Math.max(10, zoom - 10))}
                  className="text-zinc-400 hover:text-zinc-800 dark:hover:text-white font-bold text-sm px-2 py-0.5 select-none"
                >
                  -
                </button>
                <span className="text-xs font-extrabold text-zinc-500 dark:text-zinc-400 min-w-[84px] text-center select-none">Zoom: {zoom}%</span>
                <button
                  onClick={() => setZoom(Math.min(300, zoom + 10))}
                  className="text-zinc-400 hover:text-zinc-800 dark:hover:text-white font-bold text-sm px-2 py-0.5 select-none"
                >
                  +
                </button>
                <span className="w-px h-4 bg-zinc-200 dark:bg-zinc-850" />
                <button
                  onClick={() => {
                    const img = imgRef.current;
                    if (img) fitImageToWorkspace(img.naturalWidth, img.naturalHeight);
                  }}
                  className="text-[10px] text-zinc-550 hover:text-zinc-800 dark:hover:text-white uppercase font-bold tracking-wider select-none"
                >
                  Fit Screen
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function PhotoSuitePage() {
  return (
    <Suspense fallback={
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-zinc-500 font-semibold select-none">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-650 border-t-transparent mx-auto" />
          <p className="text-xs tracking-wider uppercase font-bold text-zinc-400 dark:text-zinc-500">Loading Creative Studio...</p>
        </div>
      </div>
    }>
      <PhotoSuiteContent />
    </Suspense>
  );
}
