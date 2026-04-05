import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketContext";
import UserAvatars from "../components/UserAvatars";
import ChatSidebar from "../components/ChatSidebar";

const TOOLS = ["pen", "eraser", "line", "rect", "circle"];

const WhiteboardPage = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const userName = searchParams.get("name") || localStorage.getItem("collabUserName") || "Anonymous";

  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const isDrawing = useRef(false);
  const currentStroke = useRef([]);
  const remoteStrokes = useRef({});
  // Local undo stack (client-side for responsive feel)
  const localUndoStack = useRef([]);

  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#1a1a2e");
  const [lineWidth, setLineWidth] = useState(3);
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("Untitled Whiteboard");
  const [isCopied, setIsCopied] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const chatOpenRef = useRef(chatOpen);
  chatOpenRef.current = chatOpen;

  const myColor = users.find((u) => u.name === userName)?.color || "#6c63ff";

  const COLORS = [
    "#1a1a2e", "#e63946", "#2a9d8f", "#f4a261",
    "#457b9d", "#a8dadc", "#6d6875", "#ffffff",
  ];

  // ---- Canvas helpers ----
  const getCtx = () => canvasRef.current?.getContext("2d");

  const drawStroke = useCallback((ctx, stroke) => {
    if (!stroke.points || stroke.points.length < 2) return;
    ctx.save();
    ctx.strokeStyle = stroke.tool === "eraser" ? "#ffffff" : stroke.color;
    ctx.lineWidth = stroke.tool === "eraser" ? stroke.width * 3 : stroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalCompositeOperation =
      stroke.tool === "eraser" ? "destination-out" : "source-over";

    if (stroke.tool === "pen" || stroke.tool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    } else if (stroke.tool === "line" && stroke.points.length >= 2) {
      const p0 = stroke.points[0];
      const p1 = stroke.points[stroke.points.length - 1];
      ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
    } else if (stroke.tool === "rect" && stroke.points.length >= 2) {
      const p0 = stroke.points[0]; const p1 = stroke.points[stroke.points.length - 1];
      ctx.strokeRect(p0.x, p0.y, p1.x - p0.x, p1.y - p0.y);
    } else if (stroke.tool === "circle" && stroke.points.length >= 2) {
      const p0 = stroke.points[0]; const p1 = stroke.points[stroke.points.length - 1];
      const rx = Math.abs(p1.x - p0.x) / 2; const ry = Math.abs(p1.y - p0.y) / 2;
      const cx = p0.x + (p1.x - p0.x) / 2; const cy = p0.y + (p1.y - p0.y) / 2;
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI); ctx.stroke();
    }
    ctx.restore();
  }, []);

  const redrawAll = useCallback((strokes) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = getCtx();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokes.forEach((s) => drawStroke(ctx, s));
  }, [drawStroke]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      const imgData = getCtx()?.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      if (imgData) getCtx()?.putImageData(imgData, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Keyboard shortcuts: Ctrl+Z undo, Ctrl+Y redo
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        socket?.emit("whiteboard-undo", { roomId });
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        socket?.emit("whiteboard-redo", { roomId });
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [socket, roomId]);

  // Socket events
  useEffect(() => {
    if (!socket) return;

    socket.emit("join-whiteboard", { roomId, userName });
    setIsConnected(true);

    socket.on("whiteboard-state", ({ strokes, title: t }) => {
      if (t) setTitle(t);
      redrawAll(strokes);
    });

    socket.on("new-stroke", ({ stroke }) => {
      drawStroke(getCtx(), stroke);
    });

    socket.on("live-draw", ({ id, points, color: c, width, tool: t }) => {
      const overlay = overlayRef.current;
      if (!overlay) return;
      const ctx = overlay.getContext("2d");
      ctx.clearRect(0, 0, overlay.width, overlay.height);
      remoteStrokes.current[id] = { points, color: c, width, tool: t };
      Object.values(remoteStrokes.current).forEach((s) => drawStroke(ctx, s));
    });

    socket.on("whiteboard-cleared", () => {
      const canvas = canvasRef.current;
      getCtx()?.clearRect(0, 0, canvas.width, canvas.height);
    });

    socket.on("whiteboard-title-update", ({ title: t }) => setTitle(t));
    socket.on("users-update", (u) => setUsers(u));

    socket.on("chat-message", (msg) => {
      if (!chatOpenRef.current && msg.userName !== userName) {
        setUnreadCount((n) => n + 1);
      }
    });

    return () => {
      socket.off("whiteboard-state");
      socket.off("new-stroke");
      socket.off("live-draw");
      socket.off("whiteboard-cleared");
      socket.off("whiteboard-title-update");
      socket.off("users-update");
      socket.off("chat-message");
    };
  }, [socket, roomId, userName, redrawAll, drawStroke]);

  // Drawing handlers
  const startDraw = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    isDrawing.current = true;
    currentStroke.current = [getPos(e, canvas)];
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const pos = getPos(e, canvas);
    currentStroke.current.push(pos);

    if (tool === "pen" || tool === "eraser") {
      const ctx = getCtx();
      const pts = currentStroke.current;
      ctx.save();
      ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      ctx.lineWidth = tool === "eraser" ? lineWidth * 3 : lineWidth;
      ctx.lineCap = "round";
      ctx.globalCompositeOperation = tool === "eraser" ? "destination-out" : "source-over";
      if (pts.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
      }
      ctx.restore();
    }

    socket?.emit("draw-live", { roomId, points: currentStroke.current, color, width: lineWidth, tool });
  };

  const endDraw = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (!canvas || currentStroke.current.length === 0) return;

    const stroke = { points: currentStroke.current, color, width: lineWidth, tool };

    if (["line", "rect", "circle"].includes(tool)) {
      // For shape tools, redraw the final shape on canvas
      const ctx = getCtx();
      drawStroke(ctx, stroke);
    }

    socket?.emit("draw-stroke", { roomId, stroke });
    currentStroke.current = [];

    const overlay = overlayRef.current;
    if (overlay) {
      overlay.getContext("2d").clearRect(0, 0, overlay.width, overlay.height);
    }
    remoteStrokes.current = {};
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    getCtx()?.clearRect(0, 0, canvas.width, canvas.height);
    socket?.emit("whiteboard-clear", { roomId });
  };

  const handleUndo = () => socket?.emit("whiteboard-undo", { roomId });
  const handleRedo = () => socket?.emit("whiteboard-redo", { roomId });

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Draw on a white background
    const offscreen = document.createElement("canvas");
    offscreen.width = canvas.width;
    offscreen.height = canvas.height;
    const ctx = offscreen.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, offscreen.width, offscreen.height);
    ctx.drawImage(canvas, 0, 0);
    const link = document.createElement("a");
    link.download = `${title.replace(/[^a-z0-9]/gi, "_") || "whiteboard"}.png`;
    link.href = offscreen.toDataURL("image/png");
    link.click();
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const openChat = () => {
    setChatOpen(true);
    setUnreadCount(0);
  };

  return (
    <div className="whiteboard-page">
      {/* Top Bar */}
      <div className="editor-topbar">
        <button className="back-btn" onClick={() => navigate("/")}>← Home</button>
        <input
          className="doc-title-input"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            socket?.emit("whiteboard-title-change", { roomId, title: e.target.value });
          }}
          placeholder="Untitled Whiteboard"
        />
        <div className="topbar-right">
          <div className={`conn-badge ${isConnected ? "online" : "offline"}`}>
            <span className="conn-dot" />{isConnected ? "Live" : "Offline"}
          </div>
          <UserAvatars users={users} />
          <button className="icon-btn" onClick={handleUndo} title="Undo (Ctrl+Z)">↩</button>
          <button className="icon-btn" onClick={handleRedo} title="Redo (Ctrl+Y)">↪</button>
          <button className="icon-btn" onClick={downloadCanvas} title="Download PNG">⬇</button>
          <button className="icon-btn" onClick={openChat} title="Chat" style={{ position: "relative" }}>
            💬{unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
          </button>
          <button className="room-id-btn" onClick={copyRoomId}>
            {isCopied ? "✓ Copied!" : `🔗 ${roomId.slice(0, 6)}...`}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="wb-toolbar">
        <div className="tool-group">
          {TOOLS.map((t) => (
            <button
              key={t}
              className={`tool-btn ${tool === t ? "active" : ""}`}
              onClick={() => setTool(t)}
              title={t}
            >
              {t === "pen" ? "✏️" : t === "eraser" ? "🧹" : t === "line" ? "╱" : t === "rect" ? "▭" : "○"}
            </button>
          ))}
        </div>

        <div className="tool-group">
          {COLORS.map((c) => (
            <button
              key={c}
              className={`color-btn ${color === c ? "active" : ""}`}
              style={{ background: c, border: c === "#ffffff" ? "2px solid #aaa" : "none" }}
              onClick={() => setColor(c)}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="color-picker"
            title="Custom color"
          />
        </div>

        <div className="tool-group">
          <label className="size-label">Size: {lineWidth}px</label>
          <input
            type="range" min={1} max={20} value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="size-slider"
          />
        </div>

        <button className="clear-btn" onClick={handleClear}>🗑 Clear All</button>
      </div>

      {/* Canvas + Chat */}
      <div className="editor-with-chat" style={{ flex: 1, overflow: "hidden", display: "flex" }}>
        <div className="canvas-area">
          <canvas
            ref={canvasRef}
            className="main-canvas"
            style={{ cursor: tool === "eraser" ? "cell" : "crosshair" }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
          <canvas
            ref={overlayRef}
            className="overlay-canvas"
            style={{ pointerEvents: "none" }}
          />
        </div>
        <ChatSidebar
          roomId={roomId}
          userName={userName}
          userColor={myColor}
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
        />
      </div>

      <div className="editor-statusbar">
        <span>Tool: {tool}</span>
        <span>{users.length} user{users.length !== 1 ? "s" : ""} drawing</span>
        <span>Ctrl+Z undo · Ctrl+Y redo</span>
        <span className="room-id-display">Room: {roomId}</span>
      </div>
    </div>
  );
};

export default WhiteboardPage;
