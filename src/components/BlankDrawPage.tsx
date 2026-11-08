/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Palette,
  Eraser,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Sparkles,
  ArrowLeft,
  Check,
  BookOpen,
  Image as ImageIcon,
  Smile,
} from 'lucide-react';

interface SavedDrawingItem {
  id: string;
  dataUrl: string;
  createdAt: string;
  title: string;
}

interface BlankDrawPageProps {
  onBackToLibrary: () => void;
  onWeaveStoryWithDrawing: (drawingDataUrl: string, title?: string) => void;
  heroName?: string;
}

const PALETTE_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#FBBF24', // Amber/Yellow
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#78350F', // Brown
  '#1C1917', // Black
];

const STICKERS = ['⭐', '💖', '🐲', '🦄', '🌈', '👑', '🐻', '🐢', '🎈', '☀️', '🌸', '🦋'];

const LOCAL_STORAGE_SAVED_DRAWINGS_KEY = 'wondertales_saved_drawings_v1';

export const BlankDrawPage: React.FC<BlankDrawPageProps> = ({
  onBackToLibrary,
  onWeaveStoryWithDrawing,
  heroName = 'Oliver',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [currentColor, setCurrentColor] = useState<string>('#3B82F6');
  const [brushSize, setBrushSize] = useState<number>(10);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [isRainbow, setIsRainbow] = useState<boolean>(false);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  // Undo / Redo history
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Gallery of saved drawings
  const [savedDrawings, setSavedDrawings] = useState<SavedDrawingItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SAVED_DRAWINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read saved drawings:', e);
    }
    return [];
  });

  const [notification, setNotification] = useState<string | null>(null);
  const rainbowHueRef = useRef<number>(0);

  // Save gallery to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_SAVED_DRAWINGS_KEY, JSON.stringify(savedDrawings));
    } catch (e) {
      console.warn('Could not save drawings:', e);
    }
  }, [savedDrawings]);

  // Canvas init
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set high resolution canvas dimensions
    const width = 800;
    const height = 550;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      saveStateToHistory(canvas.toDataURL());
    }
  }, []);

  const saveStateToHistory = (dataUrl: string) => {
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed.slice(-15), dataUrl];
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 15));
  };

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoordinates(e);

    // If sticker stamp mode
    if (selectedSticker) {
      ctx.font = `${brushSize * 3.5 + 24}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedSticker, coords.x, coords.y);
      saveStateToHistory(canvas.toDataURL());
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;

    if (isEraser) {
      ctx.strokeStyle = '#FFFFFF';
    } else if (isRainbow) {
      rainbowHueRef.current = (rainbowHueRef.current + 20) % 360;
      ctx.strokeStyle = `hsl(${rainbowHueRef.current}, 95%, 55%)`;
    } else {
      ctx.strokeStyle = currentColor;
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || selectedSticker) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCanvasCoordinates(e);

    if (isRainbow) {
      rainbowHueRef.current = (rainbowHueRef.current + 5) % 360;
      ctx.strokeStyle = `hsl(${rainbowHueRef.current}, 95%, 55%)`;
    }

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      saveStateToHistory(canvas.toDataURL());
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      loadCanvasFromDataUrl(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      loadCanvasFromDataUrl(history[newIndex]);
    }
  };

  const loadCanvasFromDataUrl = (dataUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveStateToHistory(canvas.toDataURL());
    triggerNotification('Canvas cleared! ✨');
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `wondertales-drawing-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    triggerNotification('Picture downloaded to your device! 📥');
  };

  const handleSaveToGallery = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const newItem: SavedDrawingItem = {
      id: `draw-${Date.now()}`,
      dataUrl,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: `Drawing #${savedDrawings.length + 1}`,
    };
    setSavedDrawings((prev) => [newItem, ...prev]);
    triggerNotification('Saved to your Drawing Gallery! 🎨');
  };

  const handleWeaveStory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onWeaveStoryWithDrawing(dataUrl, `Art by ${heroName}`);
  };

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification(null);
    }, 2800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onBackToLibrary}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-stone-900 px-3.5 py-2 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Story Library</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveToGallery}
            className="px-4 py-2 bg-white hover:bg-amber-50 text-amber-950 font-bold text-xs sm:text-sm rounded-xl border border-amber-300 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Save to Gallery</span>
          </button>

          <button
            onClick={handleWeaveStory}
            className="px-5 py-2 bg-gradient-to-r from-amber-400 to-rose-400 hover:from-amber-500 hover:to-rose-500 text-amber-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-2 active:scale-95"
          >
            <BookOpen className="w-4 h-4 text-amber-950" />
            <span>Turn Art into a Story! ✨</span>
          </button>
        </div>
      </div>

      {/* Floating Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 bg-stone-900 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>{notification}</span>
        </div>
      )}

      {/* Studio Header & Tools Container */}
      <div className="bg-white rounded-3xl border border-amber-200/80 shadow-lg p-4 sm:p-6 space-y-4">
        {/* Toolbars Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400 to-amber-400 flex items-center justify-center text-white shadow-2xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-stone-900 leading-tight">
                Magic Drawing Studio
              </h2>
              <span className="text-xs text-stone-500">Draw anything you imagine, stamp stickers & turn it into a bedtime tale!</span>
            </div>
          </div>

          {/* Canvas Actions: Undo, Redo, Clear, Download */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl disabled:opacity-30 cursor-pointer"
              title="Undo last stroke"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl disabled:opacity-30 cursor-pointer"
              title="Redo stroke"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleClear}
              className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl cursor-pointer"
              title="Clear Canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl cursor-pointer"
              title="Download drawing"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Color Palette & Brush Styles Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Colors */}
          <div className="flex flex-wrap items-center gap-1.5">
            {PALETTE_COLORS.map((col) => (
              <button
                key={col}
                onClick={() => {
                  setCurrentColor(col);
                  setIsEraser(false);
                  setIsRainbow(false);
                  setSelectedSticker(null);
                }}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 transition-all cursor-pointer shadow-2xs hover:scale-110 ${
                  !isEraser && !isRainbow && !selectedSticker && currentColor === col
                    ? 'border-amber-500 scale-110 ring-2 ring-amber-300'
                    : 'border-white'
                }`}
                style={{ backgroundColor: col }}
                aria-label={`Select color ${col}`}
              />
            ))}

            {/* Rainbow Brush */}
            <button
              onClick={() => {
                setIsRainbow(true);
                setIsEraser(false);
                setSelectedSticker(null);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-full border transition-all cursor-pointer shadow-2xs bg-gradient-to-r from-red-400 via-amber-400 via-green-400 to-purple-400 text-white ${
                isRainbow && !selectedSticker ? 'ring-2 ring-amber-400 scale-105' : 'opacity-80 hover:opacity-100'
              }`}
            >
              ✨ Rainbow
            </button>

            {/* Eraser */}
            <button
              onClick={() => {
                setIsEraser(true);
                setIsRainbow(false);
                setSelectedSticker(null);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-full border transition-all cursor-pointer flex items-center gap-1 ${
                isEraser && !selectedSticker
                  ? 'bg-stone-800 text-white border-stone-800 ring-2 ring-amber-300'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border-stone-200'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Eraser</span>
            </button>
          </div>

          {/* Brush Sizes */}
          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl">
            {[
              { size: 5, label: 'Thin' },
              { size: 12, label: 'Medium' },
              { size: 26, label: 'Crayon' },
            ].map((b) => (
              <button
                key={b.size}
                onClick={() => setBrushSize(b.size)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  brushSize === b.size
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fun Sticker Stamps Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-stone-100 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Smile className="w-3.5 h-3.5 text-amber-700" />
            <span>Sticker Stamps:</span>
          </span>

          <div className="flex items-center gap-1.5">
            {STICKERS.map((stk) => (
              <button
                key={stk}
                onClick={() => {
                  if (selectedSticker === stk) {
                    setSelectedSticker(null);
                  } else {
                    setSelectedSticker(stk);
                    setIsEraser(false);
                  }
                }}
                className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all cursor-pointer ${
                  selectedSticker === stk
                    ? 'bg-amber-200 border-2 border-amber-400 scale-110 shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 border border-stone-200/60'
                }`}
                title={`Stamp ${stk}`}
              >
                {stk}
              </button>
            ))}
          </div>
        </div>

        {/* The Drawing Canvas Box */}
        <div className="w-full flex justify-center bg-stone-100 rounded-3xl p-3 sm:p-4 border-2 border-dashed border-stone-300/80 overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            className="w-full max-w-[800px] h-[340px] sm:h-[480px] bg-white rounded-2xl shadow-inner cursor-crosshair touch-none"
          />
        </div>
      </div>

      {/* Gallery of Past Saved Drawings */}
      {savedDrawings.length > 0 && (
        <div className="bg-white rounded-3xl border border-stone-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-600" />
              <h3 className="font-serif font-bold text-base text-stone-900">
                My Saved Drawings ({savedDrawings.length})
              </h3>
            </div>
            <span className="text-xs text-stone-500">Tap a drawing to continue or turn it into a story!</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {savedDrawings.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden border-2 border-stone-200 hover:border-amber-400 bg-stone-50 transition-all p-1 cursor-pointer"
                onClick={() => {
                  loadCanvasFromDataUrl(item.dataUrl);
                  triggerNotification('Loaded drawing onto canvas! 🎨');
                }}
              >
                <img
                  src={item.dataUrl}
                  alt={item.title}
                  className="w-full aspect-4/3 object-contain rounded-xl bg-white"
                />
                <div className="mt-1 flex items-center justify-between px-1 text-[11px] text-stone-600 font-medium">
                  <span className="truncate">{item.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSavedDrawings((prev) => prev.filter((d) => d.id !== item.id));
                    }}
                    className="text-stone-400 hover:text-rose-600"
                    title="Delete saved drawing"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
