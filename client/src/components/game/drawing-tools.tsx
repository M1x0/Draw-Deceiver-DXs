import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface DrawingToolsProps {
  currentTool: "pencil" | "brush" | "eraser";
  currentColor: string;
  brushSize: number;
  onToolChange: (tool: "pencil" | "brush" | "eraser") => void;
  onColorChange: (color: string) => void;
  onBrushSizeChange: (size: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  canUndo: boolean;
  canRedo: boolean;
  disabledTools?: ("pencil" | "brush" | "eraser")[];
  limitedColors?: string[];
}

const presetColors = [
  "#000000", "#FF0000", "#0000FF", "#00FF00", "#FFFF00", "#FF00FF",
  "#00FFFF", "#FFA500", "#800080", "#A52A2A", "#808080", "#FFFFFF"
];

export default function DrawingTools({
  currentTool,
  currentColor,
  brushSize,
  onToolChange,
  onColorChange,
  onBrushSizeChange,
  onUndo,
  onRedo,
  onClear,
  canUndo,
  canRedo,
  disabledTools,
  limitedColors
}: DrawingToolsProps) {
  const displayColors = limitedColors || presetColors;
  return (
    <Card className="glass-card border-none">
      <CardContent className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Tool Selection */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              className={cn(
                "px-4 py-3 rounded-xl",
                currentTool === "pencil" ? "glass-button text-white" : "glass-card text-white/80 hover:bg-white/20",
                disabledTools?.includes("pencil") && "opacity-30 cursor-not-allowed"
              )}
              onClick={() => !disabledTools?.includes("pencil") && onToolChange("pencil")}
              disabled={disabledTools?.includes("pencil")}
              data-testid="tool-pencil"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "px-4 py-3 rounded-xl",
                currentTool === "brush" ? "glass-button text-white" : "glass-card text-white/80 hover:bg-white/20",
                disabledTools?.includes("brush") && "opacity-30 cursor-not-allowed"
              )}
              onClick={() => !disabledTools?.includes("brush") && onToolChange("brush")}
              disabled={disabledTools?.includes("brush")}
              data-testid="tool-brush"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "px-4 py-3 rounded-xl",
                currentTool === "eraser" ? "glass-button text-white" : "glass-card text-white/80 hover:bg-white/20",
                disabledTools?.includes("eraser") && "opacity-30 cursor-not-allowed"
              )}
              onClick={() => !disabledTools?.includes("eraser") && onToolChange("eraser")}
              disabled={disabledTools?.includes("eraser")}
              data-testid="tool-eraser"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </Button>
          </div>

          {/* Brush Size */}
          <div className="flex items-center space-x-3">
            <span className="text-white/60 text-sm whitespace-nowrap">Size:</span>
            <Slider
              value={[brushSize]}
              onValueChange={([value]) => onBrushSizeChange(value)}
              min={1}
              max={20}
              step={1}
              className="w-24 md:w-32"
              data-testid="slider-brush-size"
            />
            <span className="text-white text-sm font-semibold w-6">{brushSize}</span>
          </div>

          {/* Color Picker */}
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            {displayColors.map((color) => (
              <button
                key={color}
                className={cn(
                  "w-8 h-8 md:w-10 md:h-10 rounded-lg cursor-pointer border-2 transition-transform hover:scale-110",
                  currentColor === color ? "border-white scale-110" : "border-white/20"
                )}
                style={{ backgroundColor: color }}
                onClick={() => onColorChange(color)}
                data-testid={`color-${color}`}
              />
            ))}
            {!limitedColors && (
              <input
                type="color"
                value={currentColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-8 h-8 md:w-10 md:h-10 rounded-lg cursor-pointer border-2 border-white/20"
                data-testid="color-picker-custom"
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              className="glass-card px-4 py-3 rounded-xl text-white/80 hover:bg-white/20"
              onClick={onUndo}
              disabled={!canUndo}
              data-testid="button-undo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
            </Button>
            <Button
              variant="ghost"
              className="glass-card px-4 py-3 rounded-xl text-white/80 hover:bg-white/20"
              onClick={onRedo}
              disabled={!canRedo}
              data-testid="button-redo"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"
                />
              </svg>
            </Button>
            <Button
              variant="ghost"
              className="glass-button-secondary px-4 py-3 rounded-xl text-white"
              onClick={onClear}
              data-testid="button-clear"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
