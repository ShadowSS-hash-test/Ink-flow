import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Pencil, Eraser, Trash2, Download } from 'lucide-react';

function Toolbutton({ label, icon, isActive = false, className = '', ...props }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`
        p-3 rounded-lg flex items-center justify-center transition-all
        ${isActive 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'}
        ${className}
      `}
      {...props}
    >
      {icon}
    </button>
  );
}

export const OfflineWhiteboard = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  
  const lastPositionRef = useRef({ x: 0, y: 0 });

  // Helper to save canvas to LocalStorage
  const saveToLocalStorage = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      localStorage.setItem('offline-whiteboard-data', canvas.toDataURL());
    }
  }, []);

  // Helper to load from LocalStorage
  const loadFromLocalStorage = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    const savedData = localStorage.getItem('offline-whiteboard-data');
    
    if (savedData && context) {
      const img = new Image();
      img.src = savedData;
      img.onload = () => {
        context.drawImage(img, 0, 0);
      };
    }
  }, []);

  const drawSegment = useCallback((x0, y0, x1, y1, style) => {
    const context = contextRef.current;
    if (!context) return;
    
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    
    context.strokeStyle = style.color;
    context.lineWidth = style.lineWidth;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    
    context.stroke();
    context.closePath();
  }, []); 

  const clearLocalCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width, canvas.height);
      localStorage.removeItem('offline-whiteboard-data');
    }
  }, []); 

  // Initialize Canvas Context and Resize Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    contextRef.current = context;

    const setCanvasSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        // Keep existing drawing when resizing
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        tempCtx.drawImage(canvas, 0, 0);

        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        
        // Re-fill white and redraw
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(tempCanvas, 0, 0);
        
        context.lineCap = 'round';
        context.lineJoin = 'round';
      }
    };
    
    setCanvasSize();
    loadFromLocalStorage(); // Load work from previous session

    window.addEventListener('resize', setCanvasSize);
    return () => window.removeEventListener('resize', setCanvasSize);
  }, [loadFromLocalStorage]); 

  const getPosition = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if (event.touches && event.touches.length > 0) {
      x = event.touches[0].clientX - rect.left;
      y = event.touches[0].clientY - rect.top;
    } else {
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }
    return { x, y };
  };

  const startDrawing = (event) => {
    if (event.touches) event.preventDefault();
    const pos = getPosition(event);
    if (!pos) return;
    setIsDrawing(true);
    lastPositionRef.current = pos;
  };

  const finishDrawing = () => {
    if (isDrawing) {
      saveToLocalStorage(); // Save every time a stroke is finished
    }
    setIsDrawing(false);
  };

  const drawing = (event) => {
    if (event.touches) event.preventDefault();
    if (!isDrawing) return; 

    const newPos = getPosition(event);
    const lastPos = lastPositionRef.current;
    if (!newPos || !lastPos) return;

    const style = {
      color: tool === 'eraser' ? '#FFFFFF' : color,
      lineWidth: tool === 'eraser' ? lineWidth * 2 : lineWidth
    };

    drawSegment(lastPos.x, lastPos.y, newPos.x, newPos.y, style);
    lastPositionRef.current = newPos;
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `whiteboard-export-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center p-4 gap-4 bg-gray-100 relative">
      
      {/* Offline Badge */}
      <div className="absolute top-4 right-4 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold border border-orange-200 z-20">
        OFFLINE MODE
      </div>

      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-3 flex flex-wrap justify-center items-center gap-4 z-10">
        
        <div className="flex flex-col items-center">
          <label htmlFor="color" className="text-xs font-medium text-gray-500 mb-1">Color</label>
          <input
            id="color"
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 rounded-full border border-gray-300 cursor-pointer p-0"
            disabled={tool === 'eraser'}
          />
        </div>

        <div className="flex flex-col items-center">
          <label htmlFor="lineWidth" className="text-xs font-medium text-gray-500 mb-1">
            Size ({lineWidth}px)
          </label>
          <input
            id="lineWidth"
            type="range"
            min="1"
            max="50"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="w-32 cursor-pointer"
          />
        </div>

        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
          <Toolbutton
            label="Pen"
            icon={<Pencil size={20} />}
            isActive={tool === 'pen'}
            onClick={() => setTool('pen')}
          />
          <Toolbutton
            label="Eraser"
            icon={<Eraser size={20} />}
            isActive={tool === 'eraser'}
            onClick={() => setTool('eraser')}
          />
        </div>
        
        <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
          <Toolbutton
            label="Download PNG"
            icon={<Download size={20} />}
            onClick={downloadImage}
            className="text-blue-600 hover:bg-blue-50"
          />
          <Toolbutton
            label="Clear All"
            icon={<Trash2 size={20} />}
            onClick={clearLocalCanvas}
            className="text-red-600 hover:bg-red-100"
          />
        </div>
      </div>

      <div className="w-full max-w-6xl flex-1 bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={finishDrawing}
          onMouseOut={finishDrawing}
          onMouseMove={drawing}
          onTouchStart={startDrawing}
          onTouchEnd={finishDrawing}
          onTouchCancel={finishDrawing}
          onTouchMove={drawing}
          className="w-full h-full cursor-crosshair touch-none"
        >
          Your browser does not support the canvas element.
        </canvas>
      </div>

    </div>
  );
}

export default OfflineWhiteboard;