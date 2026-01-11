import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Eraser, Download, RotateCcw, Minus, Plus } from 'lucide-react';

interface ColorCanvasProps {
  onBack: () => void;
  onComplete: (wasHelpful: boolean) => void;
}

const colors = [
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#06B6D4', // cyan
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#000000', // black
  '#FFFFFF', // white
];

export default function ColorCanvas({ onBack, onComplete }: ColorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#3B82F6');
  const [brushSize, setBrushSize] = useState(8);
  const [isEraser, setIsEraser] = useState(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // White background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const point = getCoordinates(e);
    if (!point) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = isEraser ? '#FFFFFF' : color;

    if (lastPoint.current) {
      ctx.beginPath();
      ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    }

    lastPoint.current = point;
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    lastPoint.current = getCoordinates(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPoint.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, rect.width, rect.height);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'my-artwork.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-xl font-bold text-gray-800">Creative Canvas</h1>
        <div className="w-16" />
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg overflow-hidden mb-4">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl p-4 shadow-lg">
        {/* Colors */}
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {colors.map((c) => (
            <motion.button
              key={c}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { setColor(c); setIsEraser(false); }}
              className={`w-8 h-8 rounded-full border-2 ${
                color === c && !isEraser ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-400' : 'border-gray-200'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        {/* Tools */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          {/* Brush size */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
            <button
              onClick={() => setBrushSize(Math.max(2, brushSize - 2))}
              className="p-1 hover:bg-gray-200 rounded-full"
            >
              <Minus className="w-4 h-4 text-gray-600" />
            </button>
            <div 
              className="rounded-full bg-gray-800"
              style={{ width: brushSize, height: brushSize, minWidth: 8 }}
            />
            <button
              onClick={() => setBrushSize(Math.min(30, brushSize + 2))}
              className="p-1 hover:bg-gray-200 rounded-full"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Eraser */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEraser(!isEraser)}
            className={`p-3 rounded-xl ${
              isEraser ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Eraser className="w-5 h-5" />
          </motion.button>

          {/* Clear */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearCanvas}
            className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>

          {/* Download */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={downloadCanvas}
            className="p-3 rounded-xl bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600"
          >
            <Download className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Done button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onComplete(true)}
          className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold"
        >
          I'm done creating! 🎨
        </motion.button>
      </div>
    </div>
  );
}
