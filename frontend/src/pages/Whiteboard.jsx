import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Pencil, 
  Eraser, 
  Trash2 
} from 'lucide-react';
import { io } from "socket.io-client";

function Toolbutton({ label, icon, isActive = false, className = '', ...props }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`
        p-3 rounded-lg flex items-center justify-center transition-all
        ${isActive 
          ? 'bg-blue-500 text-white' 
          : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'}
        ${className}
      `}
      {...props}
    >
      {icon}
    </button>
  );
}

export const Whiteboard = ({ initialRoomID = "create" }) => {
  const [username] = useState(() =>`User_${Math.floor(Math.random() * 1000)}`);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [socket, setSocket] = useState(null);
  
  const [activeRoomID, setActiveRoomID] = useState(initialRoomID);
  const [currentRoom, setCurrentRoom] = useState(initialRoomID);
  const [joinInput, setJoinInput] = useState('');

  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  
  const lastPositionRef = useRef({ x: 0, y: 0 });

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

  const draw = useCallback((x0, y0, x1, y1) => {
    const style = {
      color: tool === 'eraser' ? '#FFFFFF' : color,
      lineWidth: tool === 'eraser' ? lineWidth * 2 : lineWidth
    };
    drawSegment(x0, y0, x1, y1, style);
  }, [color, lineWidth, tool, drawSegment]);

  const clearLocalCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []); 

  useEffect(() => {
    clearLocalCanvas(); 

    const newSocket = io("http://localhost:3000", {
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.emit("joinRoom", { roomID: activeRoomID, user: username });

    newSocket.on("roomCreated", (roomID) => {
      setCurrentRoom(roomID);
    });

    newSocket.on("replay", (history) => {
      history.forEach((drawData) => {
        drawSegment(drawData.x0, drawData.y0, drawData.x1, drawData.y1, drawData.style);
      });
    });

    newSocket.on('drawing', (data) => {
      drawSegment(data.x0, data.y0, data.x1, data.y1, data.style);
    });

    newSocket.on('clearCanvas', clearLocalCanvas);

    newSocket.on('error', (err) => {
      console.error("Socket error:", err.message);
      alert(err.message);
    });

    return () => {
      newSocket.off("roomCreated");
      newSocket.off("replay");
      newSocket.off('drawing');
      newSocket.off('clearCanvas', clearLocalCanvas);
      newSocket.off('error');
      newSocket.disconnect();
    };
  }, [activeRoomID, username, drawSegment, clearLocalCanvas]); 

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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    contextRef.current = context;

    const setCanvasSize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const dataUrl = canvas.toDataURL();
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        const img = new Image();
        img.src = dataUrl;
        img.onload = () => {
          context.drawImage(img, 0, 0);
        };
        context.lineCap = 'round';
        context.lineJoin = 'round';
      }
    };
    
    setCanvasSize();
    clearLocalCanvas(); 

    window.addEventListener('resize', setCanvasSize);
    return () => {
      window.removeEventListener('resize', setCanvasSize);
    };
  }, [clearLocalCanvas]); 

  const startDrawing = (event) => {
    if (event.touches) event.preventDefault();
    const pos = getPosition(event);
    if (!pos) return;
    setIsDrawing(true);
    lastPositionRef.current = pos;
  };

  const finishDrawing = () => {
    setIsDrawing(false);
  };

  const drawing = (event) => {
    if (event.touches) event.preventDefault();
      
    if (!isDrawing || !socket) return; 

    const newPos = getPosition(event);
    const lastPos = lastPositionRef.current;
    if (!newPos || !lastPos) return;

    draw(lastPos.x, lastPos.y, newPos.x, newPos.y);
    
    const drawData = {
      x0: lastPos.x,
      y0: lastPos.y,
      x1: newPos.x,
      y1: newPos.y,
      style: {
        color: tool === 'eraser' ? '#FFFFFF' : color,
        lineWidth: tool === 'eraser' ? lineWidth * 2 : lineWidth
      }
    };
    
    socket.emit('drawing', drawData);
    
    lastPositionRef.current = newPos;
  };

  const handleClearClick = () => {
    clearLocalCanvas();
    if (socket) {
      socket.emit('clearCanvas');
    }
  };

  const handleJoinRoom = () => {
    if (joinInput.trim()) {
      setActiveRoomID(joinInput.trim());
      setCurrentRoom(joinInput.trim());
      setJoinInput('');
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center p-4 gap-4 bg-gray-100 relative">
      
      <div className="absolute top-4 right-4 bg-white p-2 rounded shadow flex items-center gap-3 z-20">
        {currentRoom !== "create" && (
          <div className="text-sm font-semibold text-gray-700 border-r pr-3">
            Room ID: {currentRoom}
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={joinInput}
            onChange={(e) => setJoinInput(e.target.value)}
            placeholder="Enter Room ID"
            className="text-sm border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-500 w-32"
          />
          <button
            onClick={handleJoinRoom}
            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors"
          >
            Join
          </button>
        </div>
      </div>

      <div className="w-full max-w-xl bg-white shadow-lg rounded-lg p-3 flex flex-wrap justify-center items-center gap-4 z-10 mt-12 sm:mt-0">
        
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
            label="Clear All"
            icon={<Trash2 size={20} />}
            onClick={handleClearClick}
            className="text-red-600 hover:bg-red-100"
          />
        </div>
      </div>

      <div className="w-full max-w-6xl flex-1 bg-white shadow-lg rounded-lg overflow-hidden">
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
          className="w-full h-full cursor-crosshair"
        >
          Your browser does not support the canvas element.
        </canvas>
      </div>

    </div>
  );
}