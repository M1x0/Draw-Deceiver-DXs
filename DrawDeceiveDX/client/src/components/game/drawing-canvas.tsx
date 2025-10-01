import React, { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { GameRoom, Player, StrokeData } from "@shared/schema";
import { ProgressRing } from "@/components/ui/progress-ring";
import DrawingTools from "./drawing-tools";
import { drawStroke, getRelativePosition, clearCanvas, getCanvasSnapshot } from "@/lib/canvas-utils";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";

interface DrawingCanvasProps {
  room: GameRoom;
  currentPlayer: Player;
  timeRemaining: number;
  onSubmitDrawing: (snapshot: string) => void;
  onDrawStroke: (stroke: StrokeData) => void;
}

export default function DrawingCanvas({
  room,
  currentPlayer,
  timeRemaining,
  onSubmitDrawing,
  onDrawStroke
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);
  const [currentTool, setCurrentTool] = useState<"pencil" | "brush" | "eraser">("pencil");
  const [currentColor, setCurrentColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [strokeCount, setStrokeCount] = useState(0);
  const [history, setHistory] = useState<StrokeData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  const currentRound = room.rounds[room.currentRound - 1];
  const timeProgress = currentRound ? (timeRemaining / (room.settings.drawingTime)) * 100 : 0;
  const gameMode = room.settings.gameMode;
  const modeData = currentRound?.modeData;

  // Check if player can draw (for relay_draw mode)
  const canDraw = gameMode === "relay_draw" 
    ? modeData?.currentDrawerId === currentPlayer.id 
    : !currentPlayer.hasSubmittedDrawing;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw all strokes from current round
    clearCanvas(canvas);
    
    // Shadow lines mode: show all strokes with transparency
    if (gameMode === "shadow_lines") {
      currentRound?.strokes.forEach((stroke) => {
        // Draw other players' strokes with transparency
        if (stroke.playerId !== currentPlayer.id) {
          const shadowStroke = {
            ...stroke,
            color: `${stroke.color}40` // Add 25% opacity
          };
          drawStroke(ctx, shadowStroke);
        } else {
          drawStroke(ctx, stroke);
        }
      });
    } else {
      currentRound?.strokes.forEach((stroke) => {
        drawStroke(ctx, stroke);
      });
    }
  }, [currentRound?.strokes, gameMode, currentPlayer.id]);

  // Stroke throttling
  useEffect(() => {
    const resetInterval = setInterval(() => {
      setStrokeCount(0);
    }, 1000);
    return () => clearInterval(resetInterval);
  }, []);

  // Eraser roulette - random eraser activation
  useEffect(() => {
    if (gameMode === "eraser_roulette") {
      const interval = setInterval(() => {
        if (Math.random() < 0.15) { // 15% chance every 2 seconds
          setCurrentTool("eraser");
          setTimeout(() => setCurrentTool("pencil"), 1000); // Force eraser for 1 second
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [gameMode]);

  // Time bomb - clear canvas randomly
  useEffect(() => {
    if (gameMode === "time_bomb" && modeData?.nextClearTime) {
      const timeUntilClear = modeData.nextClearTime - Date.now();
      if (timeUntilClear > 0) {
        const timeout = setTimeout(() => {
          handleClear();
          // Note: Server should set next clear time on next update
        }, timeUntilClear);
        return () => clearTimeout(timeout);
      }
    }
  }, [gameMode, modeData?.nextClearTime]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canDraw) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getRelativePosition(canvas, e.clientX, e.clientY);
    
    // Stencil zones - check if point is in allowed zone
    if (gameMode === "stencil_zones" && modeData?.allowedZones) {
      const inZone = modeData.allowedZones.some(zone => 
        point.x >= zone.x && point.x <= zone.x + zone.width &&
        point.y >= zone.y && point.y <= zone.y + zone.height
      );
      if (!inZone) return;
    }
    
    setIsDrawing(true);
    setCurrentPoints([point]);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canDraw) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getRelativePosition(canvas, e.clientX, e.clientY);
    setCursorPos(point);
    
    // Stencil zones - check if point is in allowed zone
    if (gameMode === "stencil_zones" && modeData?.allowedZones) {
      const inZone = modeData.allowedZones.some(zone => 
        point.x >= zone.x && point.x <= zone.x + zone.width &&
        point.y >= zone.y && point.y <= zone.y + zone.height
      );
      if (!inZone) return;
    }
    
    setCurrentPoints(prev => [...prev, point]);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw current stroke preview with mode modifications
    let finalPoints = [...currentPoints, point];
    
    // Mirror mayhem - mirror points horizontally
    if (gameMode === "mirror_mayhem") {
      finalPoints = finalPoints.map(p => ({ x: 800 - p.x, y: p.y }));
    }

    const tempStroke: StrokeData = {
      id: "temp",
      playerId: currentPlayer.id,
      points: finalPoints,
      color: currentColor,
      width: brushSize,
      tool: currentTool,
      timestamp: Date.now()
    };
    drawStroke(ctx, tempStroke);
    
    // Echo brush - duplicate stroke with delay
    if (gameMode === "echo_brush") {
      setTimeout(() => {
        const echoStroke = {
          ...tempStroke,
          id: "echo-temp",
          color: `${currentColor}80` // Semi-transparent
        };
        drawStroke(ctx, echoStroke);
      }, 300);
    }
  };

  const stopDrawing = () => {
    if (!isDrawing || !canDraw) return;
    setIsDrawing(false);

    if (currentPoints.length < 2) {
      setCurrentPoints([]);
      return;
    }

    // Throttle check
    if (strokeCount >= 60) {
      setCurrentPoints([]);
      return;
    }

    let finalPoints = currentPoints;
    
    // Mirror mayhem - mirror points horizontally
    if (gameMode === "mirror_mayhem") {
      finalPoints = currentPoints.map(p => ({ x: 800 - p.x, y: p.y }));
    }

    const stroke: StrokeData = {
      id: nanoid(),
      playerId: currentPlayer.id,
      points: finalPoints,
      color: currentColor,
      width: brushSize,
      tool: currentTool,
      timestamp: Date.now()
    };

    onDrawStroke(stroke);
    setStrokeCount(prev => prev + 1);
    setCurrentPoints([]);

    // Echo brush - send duplicate stroke with delay
    if (gameMode === "echo_brush") {
      setTimeout(() => {
        const echoStroke = {
          ...stroke,
          id: nanoid(),
          color: `${currentColor}80` // Semi-transparent
        };
        onDrawStroke(echoStroke);
      }, 500);
    }

    // Add to history for undo/redo
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(stroke);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex < 0) return;
    setHistoryIndex(historyIndex - 1);
    redrawCanvas();
  };

  const handleRedo = () => {
    if (historyIndex >= history.length - 1) return;
    setHistoryIndex(historyIndex + 1);
    redrawCanvas();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    clearCanvas(canvas);
    setHistory([]);
    setHistoryIndex(-1);
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    clearCanvas(canvas);
    history.slice(0, historyIndex + 1).forEach(stroke => {
      drawStroke(ctx, stroke);
    });
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const snapshot = getCanvasSnapshot(canvas);
    onSubmitDrawing(snapshot);
  };

  return (
    <div className="grid lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-6">
        {/* Timer & Word Display */}
        <Card className="glass-card border-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-white/60 text-sm mb-2">Your Word</div>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl md:text-3xl font-heading font-bold text-white" data-testid="player-word">
                    {currentPlayer.assignedWord}
                  </div>
                  <span
                    className={`px-3 py-1 text-sm rounded-full font-semibold ${
                      currentPlayer.role === "target"
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary/20 text-secondary"
                    }`}
                  >
                    {currentPlayer.role === "target" ? "Target" : "Deceiver"}
                  </span>
                </div>
              </div>
              <ProgressRing progress={timeProgress} size={96}>
                <div className="text-center">
                  <div className="text-2xl font-heading font-bold text-white" data-testid="time-remaining">
                    {timeRemaining}
                  </div>
                  <div className="text-xs text-white/60">seconds</div>
                </div>
              </ProgressRing>
            </div>
          </CardContent>
        </Card>

        {/* Canvas */}
        <div className="canvas-container p-6">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="w-full bg-white rounded-xl border-4 border-gray-200 cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={(e) => {
                const canvas = canvasRef.current;
                if (canvas) {
                  const point = getRelativePosition(canvas, e.clientX, e.clientY);
                  setCursorPos(point);
                }
                draw(e);
              }}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              data-testid="drawing-canvas"
            />

            {/* Fog of war overlay */}
            {gameMode === "fog_of_war" && cursorPos && (
              <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-xl"
                viewBox="0 0 800 600"
              >
                <defs>
                  <mask id="fogMask">
                    <rect width="800" height="600" fill="black" />
                    <circle
                      cx={cursorPos.x}
                      cy={cursorPos.y}
                      r={modeData?.fogRadius || 100}
                      fill="white"
                    />
                  </mask>
                </defs>
                <rect width="800" height="600" fill="rgba(0,0,0,0.7)" mask="url(#fogMask)" />
              </svg>
            )}

            {/* Stencil zones overlay */}
            {gameMode === "stencil_zones" && modeData?.allowedZones && (
              <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-xl"
                viewBox="0 0 800 600"
              >
                <defs>
                  <mask id="stencilMask">
                    <rect width="800" height="600" fill="black" />
                    {modeData.allowedZones.map((zone, i) => (
                      <rect
                        key={i}
                        x={zone.x}
                        y={zone.y}
                        width={zone.width}
                        height={zone.height}
                        fill="white"
                        rx="8"
                      />
                    ))}
                  </mask>
                </defs>
                <rect width="800" height="600" fill="rgba(139, 92, 246, 0.2)" mask="url(#stencilMask)" />
                {modeData.allowedZones.map((zone, i) => (
                  <rect
                    key={i}
                    x={zone.x}
                    y={zone.y}
                    width={zone.width}
                    height={zone.height}
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    rx="8"
                  />
                ))}
              </svg>
            )}
          </div>
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-lg text-xs">
            Strokes: {strokeCount}/60 per sec
          </div>
        </div>

        {/* Tools */}
        <DrawingTools
          currentTool={currentTool}
          currentColor={currentColor}
          brushSize={brushSize}
          onToolChange={setCurrentTool}
          onColorChange={setCurrentColor}
          onBrushSizeChange={setBrushSize}
          onUndo={handleUndo}
          onRedo={handleRedo}
          onClear={handleClear}
          canUndo={historyIndex >= 0}
          canRedo={historyIndex < history.length - 1}
          disabledTools={modeData?.disabledTools}
          limitedColors={modeData?.limitedColors}
        />

        {!currentPlayer.hasSubmittedDrawing && (
          <Button
            className="glass-button w-full py-4 rounded-xl font-heading font-bold text-lg text-white"
            onClick={handleSubmit}
            data-testid="button-submit-drawing"
          >
            ✓ Submit Drawing
          </Button>
        )}

        {currentPlayer.hasSubmittedDrawing && (
          <Card className="glass-card border-none border-2 border-success">
            <CardContent className="p-6 text-center">
              <div className="text-2xl mb-2">✓</div>
              <div className="text-white font-semibold">Drawing Submitted</div>
              <div className="text-white/60 text-sm">Waiting for other players...</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Player Status Sidebar */}
      <div className="space-y-6">
        <Card className="glass-card border-none">
          <CardContent className="p-6">
            <h3 className="font-heading text-lg font-semibold text-white mb-4">
              Round {room.currentRound}/{room.settings.rounds}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Drawing Phase</span>
                <span className="text-success font-semibold text-sm">Active</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60 text-sm">Players Drawing</span>
                <span className="text-white font-semibold text-sm">
                  {room.players.filter(p => p.hasSubmittedDrawing).length}/{room.players.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-none">
          <CardContent className="p-6">
            <h3 className="font-heading text-lg font-semibold text-white mb-4">Players</h3>
            <div className="space-y-3">
              {room.players.map((player) => (
                <div key={player.id} className="flex items-center space-x-3" data-testid={`player-status-${player.id}`}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${player.avatarColor}, ${player.avatarColor}cc)`
                    }}
                  >
                    {player.avatarInitials}
                  </div>
                  <div className="flex-1">
                    <div className="text-white font-medium text-sm">{player.username}</div>
                    <div className={`text-xs ${player.hasSubmittedDrawing ? "text-success" : "text-white/40"}`}>
                      {player.hasSubmittedDrawing ? "✓ Complete" : "Drawing..."}
                    </div>
                  </div>
                  {player.hasSubmittedDrawing ? (
                    <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
