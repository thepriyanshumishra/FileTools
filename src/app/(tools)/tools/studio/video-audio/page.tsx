"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ArrowPathIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import { useHistoryStore } from "@/lib/store/history";
import { saveDraftData, getDraftData } from "@/lib/utils/db";
import { LogoIcon } from "@/components/ui/logo-icon";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useFileTransferStore } from "@/lib/store/file-transfer";
import { cn } from "@/lib/utils";

interface AudioWaveformData {
  peaks: number[];
  duration: number;
}

interface TimelineStudioState {
  fileName: string;
  startTime: number;
  endTime: number;
  volume: number;
  speed: number;
  format: string;
}

function TimelineStudioContent() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get('draftId');
  const { addToHistory } = useHistoryStore();
  const { pendingFiles, clearPendingFiles } = useFileTransferStore();

  const [activeDraftId, setActiveDraftId] = useState<string>("");
  const isRestoringDraft = useRef(false);

  // File State
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaSrc, setMediaSrc] = useState<string>("");
  const [isAudio, setIsAudio] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [transcoding, setTranscoding] = useState<boolean>(false);
  const [transcodeProgress, setTranscodeProgress] = useState<number>(0);
  const [transcodeLog, setTranscodeLog] = useState<string>("");

  // Timeline & Playback Parameters
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // FX parameters
  const [volume, setVolume] = useState<number>(100); // percentage 0 - 200
  const [speed, setSpeed] = useState<number>(1.0); // 0.5 - 2.0
  const [outputFormat, setOutputFormat] = useState<string>("mp4");

  // Waveform for Audio files
  const [waveformData, setWaveformData] = useState<AudioWaveformData | null>(null);

  // DOM Refs
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: "success" | "error" }>>([]);

  const addToast = (message: string, type: "success" | "error") => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Generate visual waveform peaks from audio file buffer
  const generateWaveform = async (file: File) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const channelData = decodedBuffer.getChannelData(0);
      
      const step = Math.ceil(channelData.length / 200);
      const peaks: number[] = [];
      for (let i = 0; i < 200; i++) {
        let max = 0;
        for (let j = 0; j < step; j++) {
          const val = Math.abs(channelData[i * step + j] || 0);
          if (val > max) max = val;
        }
        peaks.push(max);
      }
      setWaveformData({ peaks, duration: decodedBuffer.duration });
      setDuration(decodedBuffer.duration);
      setEndTime(decodedBuffer.duration);
    } catch (err) {
      console.error("Audio waveform analysis failed:", err);
    }
  };

  const loadMedia = async (file: File, savedState?: any) => {
    setLoading(true);
    setMediaFile(file);
    const objectURL = URL.createObjectURL(file);
    setMediaSrc(objectURL);
    
    const audioCheck = file.type.startsWith("audio/") || 
                       file.name.endsWith(".mp3") || 
                       file.name.endsWith(".wav") || 
                       file.name.endsWith(".ogg") || 
                       file.name.endsWith(".aac") || 
                       file.name.endsWith(".flac") || 
                       file.name.endsWith(".m4a");

    setIsAudio(audioCheck);
    setOutputFormat(audioCheck ? "mp3" : "mp4");

    if (audioCheck) {
      await generateWaveform(file);
    }

    if (savedState) {
      setStartTime(savedState.startTime || 0);
      setEndTime(savedState.endTime || 0);
      setVolume(savedState.volume || 100);
      setSpeed(savedState.speed || 1.0);
      setOutputFormat(savedState.format || (audioCheck ? "mp3" : "mp4"));
    }

    setLoading(false);
  };

  // Handle video meta data load to extract duration
  const handleMediaMetadata = () => {
    if (mediaRef.current && !isAudio) {
      setDuration(mediaRef.current.duration);
      if (endTime === 0 || endTime > mediaRef.current.duration) {
        setEndTime(mediaRef.current.duration);
      }
    }
  };

  // HTML5 audio/video loop control sync bounds
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handleTimeUpdate = () => {
      setCurrentTime(media.currentTime);
      // Auto wrap boundary trim check
      if (media.currentTime >= endTime) {
        media.currentTime = startTime;
        if (!isPlaying) media.pause();
      }
      if (media.currentTime < startTime) {
        media.currentTime = startTime;
      }
    };

    media.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      media.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [startTime, endTime, isPlaying]);

  // Adjust volume / speed dynamic elements
  useEffect(() => {
    const media = mediaRef.current;
    if (media) {
      media.volume = Math.min(1.0, volume / 100);
      media.playbackRate = speed;
    }
  }, [volume, speed, mediaSrc]);

  // Restoring Draft Caching & Auto-Saving
  useEffect(() => {
    if (!draftId) return;

    const restoreDraft = async () => {
      isRestoringDraft.current = true;
      try {
        const draft = await getDraftData(draftId);
        if (draft && draft.editorState) {
          const state: TimelineStudioState = draft.editorState;

          // Reconstruct file from Base64
          const dataURLtoBlob = (dataurl: string) => {
            const arr = dataurl.split(',');
            const mimeMatch = arr[0].match(/:(.*?);/);
            const mime = mimeMatch ? mimeMatch[1] : '';
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            return new Blob([u8arr], { type: mime });
          };

          const blob = dataURLtoBlob(draft.base64Data);
          const file = new File([blob], state.fileName, { type: blob.type });

          await loadMedia(file, state);
          setActiveDraftId(draftId);
        }
      } catch (err) {
        console.error("Failed to restore Timeline Studio draft:", err);
      } finally {
        isRestoringDraft.current = false;
      }
    };

    restoreDraft();
  }, [draftId]);

  // Create Draft entry
  useEffect(() => {
    if (!mediaFile || isRestoringDraft.current || activeDraftId) return;

    const saveInitialDraft = async () => {
      const newDraftId = `draft_timeline_${Date.now()}`;
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Data = reader.result as string;
          const editorState: TimelineStudioState = {
            fileName: mediaFile.name,
            startTime,
            endTime,
            volume,
            speed,
            format: outputFormat
          };

          await saveDraftData(newDraftId, base64Data, editorState);
          setActiveDraftId(newDraftId);

          addToHistory({
            id: newDraftId,
            fileName: mediaFile.name,
            fileType: isAudio ? "audio" : "video",
            toolName: "Timeline Video & Audio Editor",
            fileSize: mediaFile.size,
            status: "draft"
          });
        };
        reader.readAsDataURL(mediaFile);
      } catch (err) {
        console.error("Initial draft save error:", err);
      }
    };

    if (duration > 0) {
      saveInitialDraft();
    }
  }, [mediaFile, duration, activeDraftId, isAudio]);

  // Sync settings
  useEffect(() => {
    if (!activeDraftId || !mediaFile || isRestoringDraft.current) return;

    const syncDraft = async () => {
      try {
        const draft = await getDraftData(activeDraftId);
        if (draft) {
          draft.editorState = {
            fileName: mediaFile.name,
            startTime,
            endTime,
            volume,
            speed,
            format: outputFormat
          };
          await saveDraftData(activeDraftId, draft.base64Data, draft.editorState);
        }
      } catch (err) {
        console.error("Auto-sync draft settings error:", err);
      }
    };

    const timer = setTimeout(syncDraft, 1000);
    return () => clearTimeout(timer);
  }, [startTime, endTime, volume, speed, outputFormat, activeDraftId, mediaFile]);

  // Handle incoming transferred files
  useEffect(() => {
    if (pendingFiles.length > 0) {
      const file = pendingFiles[0];
      const ext = file.name.toLowerCase();
      if (
        ext.endsWith(".mp4") || ext.endsWith(".mp3") ||
        ext.endsWith(".wav") || ext.endsWith(".m4a") ||
        ext.endsWith(".webm") || ext.endsWith(".mov") ||
        ext.endsWith(".mkv")
      ) {
        loadMedia(file);
        clearPendingFiles();
      }
    }
  }, [pendingFiles]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      loadMedia(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".mov", ".mkv", ".webm"],
      "audio/*": [".mp3", ".wav", ".m4a", ".ogg", ".flac"]
    },
    multiple: false
  });

  const togglePlay = () => {
    const media = mediaRef.current;
    if (!media) return;
    if (isPlaying) {
      media.pause();
      setIsPlaying(false);
    } else {
      media.play();
      setIsPlaying(true);
    }
  };

  // Visual audio waveform renderer on canvas
  useEffect(() => {
    const canvas = waveformCanvasRef.current;
    if (!canvas || !waveformData) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const peaks = waveformData.peaks;
    const barWidth = canvas.width / peaks.length;

    peaks.forEach((peak, index) => {
      const height = peak * canvas.height;
      const x = index * barWidth;
      const y = (canvas.height - height) / 2;

      // Color bounds mapping according to start/end selection
      const peakTime = (index / peaks.length) * duration;
      const isInRange = peakTime >= startTime && peakTime <= endTime;

      ctx.fillStyle = isInRange ? "#8b5cf6" : "#e2e8f0";
      ctx.fillRect(x, y, barWidth - 1, height);
    });
  }, [waveformData, startTime, endTime, duration]);

  // FFmpeg WASM local video transcoder compile pipeline
  const processMedia = async () => {
    if (!mediaFile) return;

    setTranscoding(true);
    setTranscodeProgress(0);
    setTranscodeLog("Initializing local FFmpeg pipeline...");

    try {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const { fetchFile, toBlobURL } = await import('@ffmpeg/util');

      const ffmpeg = new FFmpeg();
      
      ffmpeg.on('log', ({ message }) => {
        setTranscodeLog(prev => prev + "\n" + message);
        console.log("FFmpeg Log:", message);
      });

      ffmpeg.on('progress', ({ progress }) => {
        setTranscodeProgress(Math.round(progress * 100));
      });

      // Load WASM binaries from CDN
      const coreURL = await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js', 'text/javascript');
      const wasmURL = await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm', 'application/wasm');
      await ffmpeg.load({ coreURL, wasmURL });

      setTranscodeLog(prev => prev + "\nFFmpeg compiled successfully. Staging source file...");

      // Write source file to virtual FS
      const fileData = await fetchFile(mediaFile);
      await ffmpeg.writeFile("input", fileData);

      // Build FFmpeg command options array
      // Standard: ffmpeg -ss [start] -to [end] -i input -filter:a volume=[volume] -filter:v setpts=... output
      const args: string[] = [];
      
      // Fast seek trimmer bounds
      args.push("-ss", startTime.toFixed(3));
      args.push("-to", endTime.toFixed(3));
      args.push("-i", "input");

      // Apply audio volume adjustments if not standard (volume scale decimal)
      const volFilter = volume !== 100 ? `volume=${(volume / 100).toFixed(2)}` : "";
      
      // Speed adjustments filter chain (e.g. video setpts, audio atempo)
      let videoSpeedFilter = "";
      let audioSpeedFilter = "";
      if (speed !== 1.0) {
        videoSpeedFilter = `setpts=${(1 / speed).toFixed(2)}*PTS`;
        audioSpeedFilter = `atempo=${speed.toFixed(2)}`;
      }

      if (!isAudio) {
        // Video transcode configs
        if (videoSpeedFilter) args.push("-filter:v", videoSpeedFilter);
        
        let audioFilters = [];
        if (volFilter) audioFilters.push(volFilter);
        if (audioSpeedFilter) audioFilters.push(audioSpeedFilter);
        if (audioFilters.length > 0) args.push("-filter:a", audioFilters.join(","));
      } else {
        // Audio transcode configs
        let audioFilters = [];
        if (volFilter) audioFilters.push(volFilter);
        if (audioSpeedFilter) audioFilters.push(audioSpeedFilter);
        if (audioFilters.length > 0) args.push("-filter:a", audioFilters.join(","));
      }

      const outputName = `output.${outputFormat}`;
      args.push(outputName);

      setTranscodeLog(prev => prev + "\nExecuting command: ffmpeg " + args.join(" "));
      await ffmpeg.exec(args);

      // Read output buffer
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as any], { type: isAudio ? "audio/" + outputFormat : "video/" + outputFormat });

      // Trigger user download
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = mediaFile.name.replace(/\.[^/.]+$/, "") + "_trimmed." + outputFormat;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (activeDraftId) {
        addToHistory({
          id: activeDraftId,
          fileName: mediaFile.name,
          fileType: isAudio ? "audio" : "video",
          toolName: "Timeline Video & Audio Editor",
          fileSize: mediaFile.size,
          status: "exported"
        });
      }

      addToast("Media rendered and exported successfully!", "success");
    } catch (err) {
      console.error("FFmpeg transcode execution error:", err);
      addToast("Failed to transcode media file client-side.", "error");
    } finally {
      setTranscoding(false);
    }
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    const ms = Math.floor((time % 1) * 100);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="h-16 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-6 z-20">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:scale-105 transition-transform">
            <LogoIcon className="h-8 w-8 text-purple-650" />
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">FileTools</span>
          </Link>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700" />
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider font-extrabold text-purple-500 bg-purple-150 px-2 py-0.5 rounded">Timeline Studio</span>
            <h1 className="text-sm font-bold truncate max-w-[200px]">{mediaFile ? mediaFile.name : "Video & Audio Editor"}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {mediaFile && (
            <button
              onClick={processMedia}
              disabled={transcoding}
              className={cn(
                "rounded-xl px-5 py-2.5 text-xs font-bold transition-all text-white flex items-center gap-2 hover:shadow-lg active:scale-98",
                transcoding
                  ? "bg-zinc-300 dark:bg-zinc-700 cursor-not-allowed opacity-50 text-zinc-500"
                  : "bg-gradient-to-r from-purple-650 to-indigo-650 hover:shadow-purple-500/20"
              )}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              {transcoding ? "Rendering..." : "Export File"}
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace Frame */}
      {!mediaFile ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-xl text-center space-y-6"
          >
            <div className="mx-auto h-20 w-20 rounded-2xl bg-purple-50 dark:bg-purple-950/30 flex items-center justify-center text-4xl shadow-md">
              🎬
            </div>
            <div>
              <h2 className="text-2xl font-extrabold">Welcome to Timeline Video & Audio Studio</h2>
              <p className="text-sm text-zinc-500 mt-2">
                Trim clips, adjust speed and volume, and convert formats completely client-side in real-time with WebAssembly.
              </p>
            </div>

            <div 
              {...getRootProps()}
              className={cn(
                "border-2 border-dashed rounded-3xl p-12 transition-all cursor-pointer bg-white dark:bg-zinc-900 flex flex-col items-center justify-center gap-4 hover:border-purple-500",
                isDragActive ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/20" : "border-zinc-300 dark:border-zinc-800"
              )}
            >
              <input {...getInputProps()} />
              <ArrowUpTrayIcon className="h-10 w-10 text-zinc-400 dark:text-zinc-600" />
              <div>
                <p className="font-bold text-sm">Drag and drop your audio or video file here, or click to browse</p>
                <p className="text-xs text-zinc-400 mt-1">Accepts MP4, MP3, WAV, M4A, MOV, MKV files up to 100MB</p>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Left Adjustments Panel */}
          <aside className="w-80 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col overflow-y-auto z-10 p-6 space-y-6">
            <div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400 mb-4">FX Control Panel</h3>
            </div>

            {/* Volume FX slider */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase flex justify-between">
                <span>Gain / Volume</span>
                <span className="font-mono text-purple-600">{volume}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="200"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full accent-purple-650"
              />
              <p className="text-[10px] text-zinc-400 leading-relaxed">Boost volume gain up to 200% locally.</p>
            </div>

            {/* Speed factor slider */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase flex justify-between">
                <span>Playback Rate</span>
                <span className="font-mono text-purple-600">{speed.toFixed(2)}x</span>
              </label>
              <div className="grid grid-cols-5 gap-1 bg-zinc-100 dark:bg-zinc-850 p-1 rounded-xl">
                {[0.5, 0.75, 1.0, 1.5, 2.0].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setSpeed(rate)}
                    className={cn(
                      "py-1 text-[10px] font-bold rounded-lg transition-all",
                      speed === rate 
                        ? "bg-white dark:bg-zinc-900 shadow text-purple-600" 
                        : "text-zinc-500 hover:text-zinc-800"
                    )}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Output formatting selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Export Format</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-4 py-2.5 text-xs font-semibold focus:outline-none"
              >
                {isAudio ? (
                  <>
                    <option value="mp3">MPEG Audio Layer III (.mp3)</option>
                    <option value="wav">Waveform Audio File Format (.wav)</option>
                    <option value="aac">Advanced Audio Coding (.aac)</option>
                  </>
                ) : (
                  <>
                    <option value="mp4">MPEG-4 Part 14 (.mp4)</option>
                    <option value="webm">WebM HTML5 Video (.webm)</option>
                    <option value="mkv">Matroska Video Container (.mkv)</option>
                  </>
                )}
              </select>
            </div>

            {/* Selected Trimming Timestamps */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Trimming bounds</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Start Point</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={endTime}
                    value={Number(startTime.toFixed(2))}
                    onChange={(e) => setStartTime(Math.max(0, Math.min(endTime, Number(e.target.value))))}
                    className="w-full text-xs font-mono font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">End Point</label>
                  <input
                    type="number"
                    step="0.01"
                    min={startTime}
                    max={duration}
                    value={Number(endTime.toFixed(2))}
                    onChange={(e) => setEndTime(Math.max(startTime, Math.min(duration, Number(e.target.value))))}
                    className="w-full text-xs font-mono font-bold bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl px-3 py-2"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Central Rendering Viewport & Timeline Track */}
          <div className="flex-1 flex flex-col bg-zinc-100 dark:bg-zinc-950 overflow-hidden relative">
            {/* Viewport content area */}
            <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
                  <p className="text-xs font-bold text-zinc-500">Staging media elements...</p>
                </div>
              ) : isAudio ? (
                // Audio Slate layout view
                <div className="h-48 w-96 rounded-3xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-850 flex flex-col items-center justify-center p-6 gap-4">
                  <div className="h-14 w-14 rounded-full bg-purple-100 dark:bg-purple-950/30 flex items-center justify-center text-purple-650 text-2xl">
                    🎵
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Audio Track loaded</p>
                    <p className="text-sm font-extrabold truncate max-w-xs mt-1">{mediaFile.name}</p>
                  </div>
                  <audio 
                    ref={mediaRef as any} 
                    src={mediaSrc} 
                    onLoadedMetadata={handleMediaMetadata}
                    className="hidden" 
                  />
                </div>
              ) : (
                // Video Player viewport
                <div className="relative max-h-full max-w-full aspect-video shadow-2xl rounded-3xl overflow-hidden bg-black flex items-center justify-center">
                  <video
                    ref={mediaRef as any}
                    src={mediaSrc}
                    onLoadedMetadata={handleMediaMetadata}
                    onClick={togglePlay}
                    className="max-h-full max-w-full object-contain cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Interactive Timeline Track bar */}
            <div className="h-40 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 flex flex-col justify-between z-10 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex gap-4 items-center">
                  <button
                    onClick={togglePlay}
                    className="h-10 w-10 rounded-full bg-purple-650 hover:bg-purple-700 text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
                  >
                    {isPlaying ? <PauseIcon className="h-5 w-5 fill-white" /> : <PlayIcon className="h-5 w-5 fill-white" />}
                  </button>
                  <span className="text-xs font-mono font-bold text-purple-650 bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 rounded-xl">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="text-xs font-bold text-zinc-400">
                  Cut Range Selection: <span className="font-mono text-zinc-800 dark:text-zinc-200">{formatTime(startTime)} - {formatTime(endTime)}</span>
                </div>
              </div>

              {/* Slider timeline selection container */}
              <div className="relative mt-4 flex-1 flex items-center">
                {isAudio && waveformData && (
                  <div className="absolute inset-x-0 h-16 pointer-events-none opacity-40">
                    <canvas ref={waveformCanvasRef} className="w-full h-full" width={600} height={64} />
                  </div>
                )}

                {/* Range Trimmer handles track */}
                <div className="relative w-full h-4 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700">
                  {/* Selected interval highlighter */}
                  <div 
                    style={{ 
                      left: `${(startTime / duration) * 100}%`, 
                      width: `${((endTime - startTime) / duration) * 100}%` 
                    }}
                    className="absolute top-0 bottom-0 bg-purple-500/20 border-l border-r border-purple-500"
                  />
                  
                  {/* Playhead progress pointer */}
                  <div 
                    style={{ left: `${(currentTime / duration) * 100}%` }}
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 shadow"
                  />
                </div>

                {/* Double handle ranges input overlay controller */}
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.01"
                  value={startTime}
                  onChange={(e) => setStartTime(Math.min(endTime - 0.1, Number(e.target.value)))}
                  className="absolute inset-x-0 h-4 pointer-events-none appearance-none bg-transparent accent-purple-650 cursor-pointer"
                  style={{ zIndex: 12 }}
                />
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.01"
                  value={endTime}
                  onChange={(e) => setEndTime(Math.max(startTime + 0.1, Number(e.target.value)))}
                  className="absolute inset-x-0 h-4 pointer-events-none appearance-none bg-transparent accent-purple-650 cursor-pointer"
                  style={{ zIndex: 12 }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FFmpeg transcoder loader modal */}
      {transcoding && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded-3xl w-full max-w-xl shadow-2xl p-6 space-y-6 overflow-hidden"
          >
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <h3 className="text-base font-extrabold flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-purple-600 animate-pulse" />
                Rendering Output Media
              </h3>
              <span className="text-xs font-mono font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-xl">
                {transcodeProgress}%
              </span>
            </div>

            {/* Rendering Progress Bar */}
            <div className="space-y-2">
              <div className="h-3 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-650 transition-all duration-300"
                  style={{ width: `${transcodeProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-zinc-400 text-right font-bold uppercase tracking-wider">Processing client-side via WASM</p>
            </div>

            {/* Log terminal output panel */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase">Process logs</label>
              <pre className="h-44 bg-zinc-950 text-zinc-200 font-mono text-[9px] p-4 rounded-2xl overflow-y-auto leading-relaxed border border-zinc-900 shadow-inner">
                {transcodeLog}
              </pre>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-3 rounded-xl p-4 shadow-lg backdrop-blur-sm animate-slideInRight",
              toast.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-800"
                : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/30 dark:text-red-200 dark:border-red-800"
            )}
          >
            <p className="flex-1 text-xs font-bold leading-normal">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 rounded-lg p-1 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default function TimelineStudioPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 gap-4 font-sans">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
        <p className="text-xs font-bold text-zinc-500 animate-pulse">Loading Timeline Studio...</p>
      </div>
    }>
      <TimelineStudioContent />
    </Suspense>
  );
}
