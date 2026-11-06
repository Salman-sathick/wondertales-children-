import React, { useRef, useState, useEffect } from 'react';
import {
  Palette,
  Eraser,
  RotateCcw,
  Trash2,
  Sparkles,
  Check,
  X,
  Smile,
  Brush,
} from 'lucide-react';

interface DrawingStudioModalProps {
  pageNumber: number;
  isOpen: boolean;
  onClose: () => void;
  onSaveDrawing: (dataUrl: string, caption: string) => void;
  initialDrawingUrl?: string;
  heroName?: string;
}

const CRAYON_COLORS = [
  { name: 'Ruby Red', hex: '#EF4444' },
  { name: 'Sunset Orange', hex: '#F97316' },
  { name: 'Sunshine Yellow', hex: '#FACC15' },
  { name: 'Lime Green', hex: '#84CC16' },
  { name: 'Forest Emerald', hex: '#10B981' },
  { name: 'Sky Turquoise', hex: '#06B6D4' },
  { name: 'Ocean Blue', hex: '#3B82F6' },
  { name: 'Royal Purple', hex: '#8B5CF6' },
  { name: 'Berry Pink', hex: '#EC4899' },
  { name: 'Warm Brown', hex: '#78350F' },
  { name: 'Midnight', hex: '#1E293B' },
  { name: 'Pure White', hex: '#FFFFFF' },
];

const BRUSH_SIZES = [
  { label: 'Pencil', size: 4 },
  { label: 'Crayon', size: 10 },
  { label: 'Marker', size: 20 },
  { label: 'Big Chalk', size: 36 },
];

const STAMPS = ['⭐', '✨', '💖', '☀️', '🌈', '🐾', '👑', '🍄'];

export const DrawingStudioModal: React.FC<DrawingStudioModalProps> = ({
  pageNumber,
  isOpen,
  onClose,
  onSaveDrawing,
  initialDrawingUrl,
  heroName = 'the hero',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedColor, setSelectedColor] = useState('#EF4444');
  const [brushSize, setBrushSize] = useState(10);
  const [isEraser, setIsEraser] = useState(false);
  const [selectedStamp, setSelectedStamp] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  // Initialize canvas
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Handle high-dpi sharpness
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      // Fill cozy paper background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Load initial drawing if exists
      if (initialDrawingUrl) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, rect.height);
          saveState();
        };
        img.src = initialDrawingUrl;
      } else {
        saveState();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, initialDrawingUrl]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), imageData]);
  };

  const undo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // Remove current
    const previous = newHistory[newHistory.length - 1];
    ctx.putImageData(previous, 0, 0);
    setHistory(newHistory);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  // Coordinates helper
  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ('touches' in e && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else if ('clientX' in e) {
      return {
        x: (e as React.MouseEvent).clientX - rect.left,
        y: (e as React.MouseEvent).clientY - rect.top,
      };
    }
    return { x: 0, y: 0 };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);

    // If stamp is active, place stamp
    if (selectedStamp) {
      ctx.font = `${brushSize * 3.5}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedStamp, pos.x, pos.y);
      saveState();
      return;
    }

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#FFFFFF' : selectedColor;
    ctx.lineWidth = brushSize;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || selectedStamp) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveState();
    }
  };

  const handleSave = () => {
    try {
      const canvas = canvasRef.current;
      const dataUrl = canvas ? canvas.toDataURL('image/png') : '';
      onSaveDrawing(dataUrl, caption.trim() || `Illustration for Page ${pageNumber}`);
    } catch (err) {
      console.warn('Canvas export fallback:', err);
      onSaveDrawing('', caption.trim() || `Illustration for Page ${pageNumber}`);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[95vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawing-title"
      >
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-rose-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 flex items-center justify-center text-amber-950 shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                Art Studio · Page {pageNumber}
              </span>
              <h2 id="drawing-title" className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
                Draw Your Own Illustration
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
            aria-label="Close drawing studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Workspace */}
        <div className="p-4 sm:p-6 flex-1 flex flex-col lg:flex-row gap-5 overflow-y-auto">
          {/* Drawing Canvas Area */}
          <div className="flex-1 flex flex-col">
            <div className="relative w-full aspect-4/3 rounded-2xl border-3 border-amber-200 shadow-inner overflow-hidden touch-none bg-white">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-full cursor-crosshair"
              />
            </div>

            {/* What did you draw caption */}
            <div className="mt-3">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                Tell the Storyteller what you drew:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Glowing golden wings and magical star boots"
                  className="flex-1 p-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:border-amber-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                The AI storyteller will celebrate your drawing in the story narrative and voiceover!
              </p>
            </div>
          </div>

          {/* Tools Palette Sidebar */}
          <div className="w-full lg:w-72 flex flex-col gap-4">
            {/* Crayon Color Swatches */}
            <div>
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
                Wax Crayons
              </span>
              <div className="grid grid-cols-6 gap-2">
                {CRAYON_COLORS.map((c) => {
                  const isSelected = !isEraser && !selectedStamp && selectedColor === c.hex;
                  return (
                    <button
                      key={c.hex}
                      onClick={() => {
                        setSelectedColor(c.hex);
                        setIsEraser(false);
                        setSelectedStamp(null);
                      }}
                      className={`w-9 h-9 rounded-xl transition-all shadow-xs relative ${
                        isSelected ? 'scale-115 ring-2 ring-stone-900 ring-offset-2' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                      aria-label={`Color ${c.name}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Brush Sizes */}
            <div>
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                Brush Thickness
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {BRUSH_SIZES.map((b) => (
                  <button
                    key={b.size}
                    onClick={() => setBrushSize(b.size)}
                    className={`p-2 rounded-xl border text-center text-xs font-bold transition-all ${
                      brushSize === b.size
                        ? 'border-amber-500 bg-amber-50 text-amber-950 shadow-2xs'
                        : 'border-stone-200 hover:border-stone-300 text-stone-600'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Magic Stamps */}
            <div>
              <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-1.5">
                Magic Stamp Stickers
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {STAMPS.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSelectedStamp(selectedStamp === s ? null : s);
                      setIsEraser(false);
                    }}
                    className={`h-10 text-xl rounded-xl border transition-all flex items-center justify-center ${
                      selectedStamp === s
                        ? 'border-amber-500 bg-amber-100 shadow-2xs scale-105'
                        : 'border-stone-200 hover:bg-stone-50'
                    }`}
                    title={`Stamp ${s}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Eraser & Utility Actions */}
            <div className="pt-2 border-t border-stone-100 grid grid-cols-3 gap-2">
              <button
                onClick={() => {
                  setIsEraser(true);
                  setSelectedStamp(null);
                }}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition-all ${
                  isEraser
                    ? 'border-rose-400 bg-rose-50 text-rose-900 shadow-2xs'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Eraser className="w-4 h-4" />
                <span>Eraser</span>
              </button>

              <button
                onClick={undo}
                disabled={history.length <= 1}
                className="p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-40 flex flex-col items-center justify-center gap-1 text-xs font-bold transition-colors"
                title="Undo last stroke"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Undo</span>
              </button>

              <button
                onClick={clearCanvas}
                className="p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 flex flex-col items-center justify-center gap-1 text-xs font-bold transition-colors"
                title="Start over on a fresh page"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-stone-600 hover:text-stone-900 font-semibold text-xs sm:text-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Save My Drawing to Page {pageNumber}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
