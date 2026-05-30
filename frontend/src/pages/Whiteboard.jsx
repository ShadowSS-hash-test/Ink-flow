import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Pencil, Eraser, Trash2, Users, Hash, ChevronRight, MousePointer2, Copy, ArrowLeft } from 'lucide-react';
import { io } from "socket.io-client";
import { toast } from "react-hot-toast"
import { useUserStore } from '../stores/useUserStore';
import { useNavigate, useLocation } from 'react-router-dom';
import dotenv from "dotenv"


dotenv.config()

const COLORS = [
  '#0f0f0f', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899',
  '#ffffff',
];

function ToolButton({ label, icon, isActive = false, onClick, danger = false }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'background 0.15s, transform 0.1s',
        background: isActive ? '#3b82f6' : 'transparent',
        color: isActive ? '#fff' : danger ? '#ef4444' : '#374151',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        if (!isActive) e.currentTarget.style.background = danger ? '#fef2f2' : '#f3f4f6';
      }}
      onMouseLeave={e => {
        if (!isActive) e.currentTarget.style.background = 'transparent';
      }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.92)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {icon}
    </button>
  );
}

export const Whiteboard = () => {

  const navigate = useNavigate(); 
  const location = useLocation();
  
  // Get room ID from router state, fallback to "create"
  const initialRoomID = location.state?.roomID || "create";

  const { user } = useUserStore();
  const username = user.username;
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [socket, setSocket] = useState(null);

  const [activeRoomID, setActiveRoomID] = useState(initialRoomID);
  const [currentRoom, setCurrentRoom] = useState(initialRoomID);
  
  const lastValidRoomRef = useRef(initialRoomID); 

  const [joinInput, setJoinInput] = useState('');
  const [showRoomPanel, setShowRoomPanel] = useState(false);

  const [activeUsers, setActiveUsers] = useState([]);
  const [cursors, setCursors] = useState({});
  const lastCursorEmit = useRef(0);

  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#0f0f0f');
  const [lineWidth, setLineWidth] = useState(4);

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
      lineWidth: tool === 'eraser' ? lineWidth * 3 : lineWidth,
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
    const newSocket = io( process.env.NODE_ENV === "Development" ? "http://localhost:3000" : "https://ink-flow.onrender.com", { withCredentials: true });
    setSocket(newSocket);
    
    newSocket.emit("joinRoom", { roomID: activeRoomID, user: username });
    
    newSocket.on("roomCreated", (roomID) => {
      setCurrentRoom(roomID);
      lastValidRoomRef.current = roomID; 
    });
    
    newSocket.on("replay", (history) => {
      history.forEach((d) => drawSegment(d.x0, d.y0, d.x1, d.y1, d.style));
    });
    
    newSocket.on('drawing', (data) => {
      drawSegment(data.x0, data.y0, data.x1, data.y1, data.style);
    });

    newSocket.on("active-users", (detailedUsersArray) => {
      setActiveUsers(detailedUsersArray);
      lastValidRoomRef.current = activeRoomID; 
    });

    newSocket.on("cursorUpdate", (data) => {
      setCursors(prev => ({ ...prev, [data.socketId]: { x: data.x, y: data.y } }));
    });

    newSocket.on("cursor-left", (socketId) => {
      setCursors(prev => {
        const newCursors = { ...prev };
        delete newCursors[socketId];
        return newCursors;
      });
    });

    newSocket.on('clearCanvas', clearLocalCanvas);
    
    newSocket.on('error', (err) => { 
      console.error(err); 
      toast.error(err.message); 
      
      if (err.message.includes("exist") || err.message.includes("full")) {
        setActiveRoomID(lastValidRoomRef.current);
        setCurrentRoom(lastValidRoomRef.current);
      }
    });
    
    return () => {
      newSocket.off("roomCreated");
      newSocket.off("replay");
      newSocket.off('drawing');
      newSocket.off("active-users");
      newSocket.off("cursorUpdate");
      newSocket.off("cursor-left");
      newSocket.off('clearCanvas');
      newSocket.off('error');
      newSocket.disconnect();
    };
  }, [activeRoomID, username, drawSegment, clearLocalCanvas]);

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
        img.onload = () => context.drawImage(img, 0, 0);
        context.lineCap = 'round';
        context.lineJoin = 'round';
      }
    };
    setCanvasSize();
    clearLocalCanvas();
    window.addEventListener('resize', setCanvasSize);
    return () => window.removeEventListener('resize', setCanvasSize);
  }, [clearLocalCanvas]);

  const getPosition = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (event.touches && event.touches.length > 0) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top,
      };
    }
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const startDrawing = (event) => {
    if (event.touches) event.preventDefault();
    const pos = getPosition(event);
    if (!pos) return;
    setIsDrawing(true);
    lastPositionRef.current = pos;
  };

  const finishDrawing = () => setIsDrawing(false);

  const handleMouseMove = (event) => {
    if (event.touches) event.preventDefault();
    const pos = getPosition(event);
    if (!pos) return;

    if (socket && Date.now() - lastCursorEmit.current > 33) {
      socket.emit("cursorMove", { x: pos.x, y: pos.y });
      lastCursorEmit.current = Date.now();
    }

    if (!isDrawing || !socket) return;
    const lastPos = lastPositionRef.current;
    if (!lastPos) return;

    draw(lastPos.x, lastPos.y, pos.x, pos.y);
    socket.emit('drawing', {
      x0: lastPos.x, y0: lastPos.y, x1: pos.x, y1: pos.y,
      style: {
        color: tool === 'eraser' ? '#FFFFFF' : color,
        lineWidth: tool === 'eraser' ? lineWidth * 3 : lineWidth,
      },
    });
    lastPositionRef.current = pos;
  };

  const handleClearClick = () => {
    clearLocalCanvas();
    if (socket) socket.emit('clearCanvas');
  };

  const handleJoinRoom = () => {
    if (joinInput.trim()) {
      setActiveRoomID(joinInput.trim());
      setCurrentRoom(joinInput.trim());
      setJoinInput('');
      setShowRoomPanel(false);
    }
  };

  const handleCopyRoomID = () => {
    if (currentRoom && currentRoom !== 'create') {
      navigator.clipboard.writeText(currentRoom);
      toast.success("Room ID copied to clipboard!");
    }
  };

  const sizeLabel = tool === 'eraser'
    ? `${lineWidth * 3}px`
    : `${lineWidth}px`;

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
          onMouseMove={handleMouseMove}    
          onTouchStart={startDrawing}
          onTouchEnd={finishDrawing}
          onTouchCancel={finishDrawing}
          onTouchMove={handleMouseMove}    
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            cursor: tool === 'eraser' ? 'cell' : 'crosshair',
          }}
        >
          Your browser does not support the canvas element.
        </canvas>

        {/* Live Cursors Overlay */}
        {Object.entries(cursors).map(([socketId, cursorData]) => {
          const u = activeUsers.find(user => user.socketId === socketId);
          if (!u) return null;

          return (
            <div 
              key={socketId}
              style={{
                position: 'absolute',
                left: cursorData.x,
                top: cursorData.y,
                pointerEvents: 'none',
                transition: 'left 0.05s linear, top 0.05s linear', 
                zIndex: 50,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}
            >
              <MousePointer2 
                size={22} 
                color={u.color} 
                fill={u.color} 
                style={{ transform: 'rotate(-15deg) translate(-2px, -2px)' }} 
              />
              <div style={{
                background: u.color,
                color: '#fff',
                fontSize: 10,
                padding: '2px 6px',
                borderRadius: 4,
                marginTop: 2,
                marginLeft: 10,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
              }}>
                {u.username}
              </div>
            </div>
          );
        })}
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

        <ToolButton label="Clear canvas" icon={<Trash2 size={18} />} onClick={handleClearClick} danger />
      </div>

      {/* RIGHT SIDEBAR WRAPPER */}
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

        {/* Room badge + toggle */}
        <button
          onClick={() => setShowRoomPanel(p => !p)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: '#ffffff',
            border: 'none',
            borderRadius: 12,
            padding: '8px 14px',
            cursor: 'pointer',
            boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
            fontSize: 13,
            fontWeight: 500,
            color: '#374151',
          }}
        >
          <Users size={15} color="#6b7280" />
          {currentRoom !== 'create' ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Hash size={13} color="#9ca3af" />
              <span style={{ color: '#111827', fontWeight: 600 }}>{currentRoom}</span>
            </span>
          ) : (
            <span style={{ color: '#6b7280' }}>No room</span>
          )}
          <ChevronRight
            size={14}
            color="#9ca3af"
            style={{ transform: showRoomPanel ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          />
        </button>

        {/* Join panel Dropdown */}
        {showRoomPanel && (
          <div style={{
            background: '#ffffff',
            borderRadius: 14,
            padding: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            minWidth: 220,
          }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
              JOIN OR CREATE A ROOM
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                placeholder="Room ID…"
                style={{
                  flex: 1,
                  fontSize: 13,
                  border: '1px solid #e5e7eb',
                  borderRadius: 8,
                  padding: '7px 10px',
                  outline: 'none',
                  color: '#111827',
                  background: '#f9fafb',
                }}
              />
              <button
                onClick={handleJoinRoom}
                style={{
                  background: '#3b82f6',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '7px 14px',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Join
              </button>
            </div>
            
            {currentRoom !== 'create' && (
              <div 
                onClick={handleCopyRoomID}
                title="Copy to clipboard"
                onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
                style={{
                  background: '#eff6ff',
                  borderRadius: 8,
                  padding: '8px 10px',
                  fontSize: 12,
                  color: '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 6,
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  marginTop: 4
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Hash size={12} />
                  <span>Room ID: <strong>{currentRoom}</strong></span>
                </div>
                <Copy size={14} color="#3b82f6" />
              </div>
            )}
          </div>
        )}

        {/* ACTIVE USERS FLOATING SIDEBAR */}
        {currentRoom !== 'create' && activeUsers.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(12px)',
            borderRadius: 16,
            padding: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            minWidth: 180,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.05em' }}>
                ACTIVE USERS ({activeUsers.length})
              </div>
              
              <button
                onClick={handleCopyRoomID}
                title="Copy Room ID"
                onMouseEnter={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#374151'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 4,
                  borderRadius: 6,
                  transition: 'all 0.2s'
                }}
              >
                <Copy size={14} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {activeUsers.map(u => (
                <div key={u.socketId} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ 
                    width: 26, 
                    height: 26, 
                    borderRadius: '50%', 
                    background: u.color, 
                    color: '#fff', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: 12, 
                    fontWeight: 600 
                  }}>
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ 
                    fontSize: 13, 
                    color: '#374151', 
                    fontWeight: u.socketId === socket?.id ? 600 : 500,
                    maxWidth: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {u.username} {u.socketId === socket?.id && <span style={{ color: '#9ca3af', fontWeight: 400 }}>(You)</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* User badge — bottom left */}
      <div style={{
        position: 'absolute',
        bottom: 16,
        left: 20,
        zIndex: 10,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(8px)',
        borderRadius: 10,
        padding: '6px 12px',
        fontSize: 12,
        color: '#6b7280',
        fontWeight: 500,
        boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}>
        <div style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#22c55e',
        }} />
        {username}
      </div>

    </div>
  );
};