import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Pencil, Eraser, Trash2, Download, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDrawingStore } from '../stores/useDrawingStore';

const COLORS = [
  '#0f0f0f', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899',
  '#ffffff',
];

function ToolButton({ label, icon, isActive = false, onClick, danger = false, disabled = false }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s, transform 0.1s',
        background: isActive ? '#3b82f6' : 'transparent',
        color: isActive ? '#fff' : danger ? '#ef4444' : disabled ? '#9ca3af' : '#374151',
        opacity: disabled ? 0.6 : 1,
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        if (!isActive && !disabled) e.currentTarget.style.background = danger ? '#fef2f2' : '#f3f4f6';
      }}
      onMouseLeave={e => {
        if (!isActive && !disabled) e.currentTarget.style.background = 'transparent';
      }}
      onMouseDown={e => { if (!disabled) e.currentTarget.style.transform = 'scale(0.92)'; }}
      onMouseUp={e => { if (!disabled) e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {icon}
    </button>
  );
}

export const OfflineWhiteboard = () => {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  
  // --- ZUSTAND STORE ---
  const { currentBoard, updateBoard, loading } = useDrawingStore();

  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#0f0f0f');
  const [lineWidth, setLineWidth] = useState(4);
  
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
        context.lineWidth = action.tool === 'eraser' ? action.lineWidth * 3 : action.lineWidth;
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
      let savedData = currentBoard?.elements;
      
      if (typeof savedData === 'string') {
        savedData = JSON.parse(savedData);
      }

      if (savedData && Array.isArray(savedData)) {
        eventLogRef.current = savedData; 
      } else {
        eventLogRef.current = []; 
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
      lineWidth: tool === 'eraser' ? lineWidth * 3 : lineWidth
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

  const sizeLabel = tool === 'eraser' ? `${lineWidth * 3}px` : `${lineWidth}px`;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#f0f0f0',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative',
    }}>
      
      {/* GO BACK BUTTON */}
      <div style={{ position: 'absolute', top: 16, left: 20, zIndex: 20 }}>
        <button
          onClick={() => navigate(-1)}
          onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
          onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: '#ffffff',
            border: 'none',
            borderRadius: 12,
            padding: '8px 14px',
            cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
            fontSize: 13,
            fontWeight: 600,
            color: '#374151',
            transition: 'transform 0.1s, background 0.2s',
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* Canvas Wrapper */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
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
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            cursor: tool === 'eraser' ? 'cell' : 'crosshair',
          }}
        >
          Your browser does not support the canvas element.
        </canvas>
      </div>

      {/* Floating toolbar — left-center */}
      <div style={{
        position: 'absolute',
        left: 20,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        background: '#ffffff',
        borderRadius: 16,
        padding: '12px 8px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)',
        zIndex: 10,
        minWidth: 56,
      }}>

        <ToolButton label="Pen" icon={<Pencil size={18} />} isActive={tool === 'pen'} onClick={() => setTool('pen')} />
        <ToolButton label="Eraser" icon={<Eraser size={18} />} isActive={tool === 'eraser'} onClick={() => setTool('eraser')} />

        <div style={{ width: 32, height: 1, background: '#e5e7eb', margin: '2px 0' }} />

        {COLORS.map((c) => (
          <button
            key={c}
            aria-label={`Color ${c}`}
            title={c}
            onClick={() => { setColor(c); if (tool === 'eraser') setTool('pen'); }}
            style={{
              width: c === color && tool !== 'eraser' ? 28 : 22,
              height: c === color && tool !== 'eraser' ? 28 : 22,
              borderRadius: '50%',
              background: c,
              border: c === color && tool !== 'eraser'
                ? '2.5px solid #3b82f6'
                : c === '#ffffff'
                ? '1.5px solid #d1d5db'
                : '1.5px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.12s',
              flexShrink: 0,
            }}
          />
        ))}

        <div style={{ width: 32, height: 1, background: '#e5e7eb', margin: '2px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500, letterSpacing: '0.03em' }}>{sizeLabel}</span>
          <input
            type="range"
            min="1"
            max="40"
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            aria-label="Brush size"
            style={{ writingMode: 'vertical-lr', direction: 'rtl', width: 28, height: 80, cursor: 'pointer', accentColor: '#3b82f6' }}
          />
        </div>

        <div style={{ width: 32, height: 1, background: '#e5e7eb', margin: '2px 0' }} />

        <ToolButton label="Clear canvas" icon={<Trash2 size={18} />} onClick={clearCanvas} danger />
      </div>

      {/* TOP RIGHT CLOUD ACTIONS */}
      <div style={{
        position: 'absolute',
        top: 16,
        right: 16,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: 12,
      }}>
        
        {/* Action Panel */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          padding: '8px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
          display: 'flex',
          gap: 6,
        }}>
          <button
            onClick={downloadImage}
            title="Download PNG"
            onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 12px',
              border: 'none',
              background: 'transparent',
              borderRadius: 8,
              cursor: 'pointer',
              color: '#374151',
              fontWeight: 500,
              fontSize: 13,
              gap: 6,
              transition: 'background 0.2s'
            }}
          >
            <Download size={16} color="#3b82f6" />
            Export
          </button>
          
          <button
            onClick={handleSaveToServer}
            disabled={loading || !currentBoard}
            title="Save to Cloud"
            onMouseEnter={e => { if (!loading && currentBoard) e.currentTarget.style.background = '#dcfce7' }}
            onMouseLeave={e => { if (!loading && currentBoard) e.currentTarget.style.background = '#f0fdf4' }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 12px',
              border: 'none',
              background: (!loading && currentBoard) ? '#f0fdf4' : '#f3f4f6',
              borderRadius: 8,
              cursor: (!loading && currentBoard) ? 'pointer' : 'not-allowed',
              color: (!loading && currentBoard) ? '#166534' : '#9ca3af',
              fontWeight: 500,
              fontSize: 13,
              gap: 6,
              transition: 'background 0.2s'
            }}
          >
            <Save size={16} color={(!loading && currentBoard) ? "#22c55e" : "#9ca3af"} />
            {loading ? "Saving..." : "Save"}
          </button>
        </div>

      </div>

    </div>
  );
}

export default OfflineWhiteboard;