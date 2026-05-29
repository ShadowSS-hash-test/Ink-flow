import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Pencil, Eraser, Trash2, Download, Save } from 'lucide-react';
import { useDrawingStore } from '../stores/useDrawingStore'; 

function Toolbutton({ label, icon, isActive = false, className = '', ...props }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`
        p-3 rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed
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
  
  // --- ZUSTAND STORE ---
  const { currentBoard, updateBoard, loading } = useDrawingStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  
  // --- THE EVENT LOG ---
  const eventLogRef = useRef([]); 
  const currentActionRef = useRef(null); 
  const lastPositionRef = useRef({ x: 0, y: 0 });

  // --- REPLAY ENGINE ---
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    // 1. Start with a blank canvas
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Fast-forward through history!
    eventLogRef.current.forEach(action => {
      if (action.type === 'clear') {
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);
      } 
      else if (action.type === 'draw' && action.points.length > 0) {
        context.beginPath();
        context.strokeStyle = action.tool === 'eraser' ? '#FFFFFF' : action.color;
        context.lineWidth = action.tool === 'eraser' ? action.lineWidth * 2 : action.lineWidth;
        context.lineCap = 'round';
        context.lineJoin = 'round';

        context.moveTo(action.points[0].x, action.points[0].y);
        for (let i = 1; i < action.points.length; i++) {
          context.lineTo(action.points[i].x, action.points[i].y);
        }
        context.stroke();
      }
    });
  }, []);

  // --- SAVING LOGIC ---
  const handleSaveToServer = async () => {
    if (currentBoard) {
      await updateBoard({ 
        boardId: currentBoard.id, 
        elements: eventLogRef.current 
      });
    }
  };

  // --- LOADING LOGIC ---
  const loadInitialData = useCallback(() => {
    try {
      // Pull directly from the database store
      let savedData = currentBoard?.elements;
      
      // Safety check in case the stringification on the backend returns a string to the frontend
      if (typeof savedData === 'string') {
        savedData = JSON.parse(savedData);
      }

      if (savedData && Array.isArray(savedData)) {
        eventLogRef.current = savedData; 
      } else {
        eventLogRef.current = []; // Ensure it's empty if no data exists
      }
      
      redrawCanvas(); 
    } catch (error) {
      console.error("Failed to load whiteboard data", error);
      eventLogRef.current = [];
      redrawCanvas();
    }
  }, [currentBoard, redrawCanvas]);

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

  const clearCanvas = useCallback(() => {
    eventLogRef.current = []; // Empty the array to save DB space
    redrawCanvas();
  }, [redrawCanvas]); 

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    contextRef.current = context;

    const setCanvasSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        redrawCanvas();
      }
    };
    
    setCanvasSize();
    loadInitialData();

    window.addEventListener('resize', setCanvasSize);
    return () => window.removeEventListener('resize', setCanvasSize);
  }, [loadInitialData, redrawCanvas]); 

  const getPosition = (event) => {
    const canvas = canvasRef.current;
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

    currentActionRef.current = {
      type: 'draw',
      tool,
      color,
      lineWidth,
      points: [pos]
    };
  };

  const drawing = (event) => {
    if (event.touches) event.preventDefault();
    if (!isDrawing) return; 

    const newPos = getPosition(event);
    const lastPos = lastPositionRef.current;
    if (!newPos || !lastPos) return;

    if (currentActionRef.current) {
      currentActionRef.current.points.push(newPos);
    }

    const style = {
      color: tool === 'eraser' ? '#FFFFFF' : color,
      lineWidth: tool === 'eraser' ? lineWidth * 2 : lineWidth
    };

    drawSegment(lastPos.x, lastPos.y, newPos.x, newPos.y, style);
    lastPositionRef.current = newPos;
  };

  const finishDrawing = () => {
    if (isDrawing && currentActionRef.current) {
      eventLogRef.current.push(currentActionRef.current);
      currentActionRef.current = null; 
    }
    setIsDrawing(false);
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
      
      {/* Dynamic Status Badge */}
      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold border z-20 ${currentBoard ? 'bg-green-100 text-green-800 border-green-200' : 'bg-orange-100 text-orange-800 border-orange-200'}`}>
        {currentBoard ? `CLOUD SYNC: ${currentBoard.title}` : 'OFFLINE MODE'}
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
            label={loading ? "Saving..." : "Save to Cloud"}
            icon={<Save size={20} />}
            onClick={handleSaveToServer}
            disabled={loading || !currentBoard}
            className="text-green-600 hover:bg-green-50"
          />
          <Toolbutton
            label="Download PNG"
            icon={<Download size={20} />}
            onClick={downloadImage}
            className="text-blue-600 hover:bg-blue-50"
          />
          <Toolbutton
            label="Clear All"
            icon={<Trash2 size={20} />}
            onClick={clearCanvas}
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