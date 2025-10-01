import { StrokeData } from "@shared/schema";

export interface Point {
  x: number;
  y: number;
}

export function drawStroke(
  ctx: CanvasRenderingContext2D,
  stroke: StrokeData
) {
  if (stroke.points.length < 2) return;

  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.width;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (stroke.tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
  } else {
    ctx.globalCompositeOperation = "source-over";
  }

  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

  for (let i = 1; i < stroke.points.length; i++) {
    ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
  }

  ctx.stroke();
  ctx.globalCompositeOperation = "source-over";
}

export function clearCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function getCanvasSnapshot(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/png");
}

export function loadCanvasSnapshot(
  canvas: HTMLCanvasElement,
  snapshot: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      resolve();
    };
    img.onerror = reject;
    img.src = snapshot;
  });
}

export function getRelativePosition(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number
): Point {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

export function floodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColor: string
) {
  const canvas = ctx.canvas;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  
  const startPos = (startY * canvas.width + startX) * 4;
  const startR = pixels[startPos];
  const startG = pixels[startPos + 1];
  const startB = pixels[startPos + 2];
  const startA = pixels[startPos + 3];

  // Convert fillColor to RGB
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d')!;
  tempCtx.fillStyle = fillColor;
  tempCtx.fillRect(0, 0, 1, 1);
  const fillData = tempCtx.getImageData(0, 0, 1, 1).data;
  const fillR = fillData[0];
  const fillG = fillData[1];
  const fillB = fillData[2];

  if (startR === fillR && startG === fillG && startB === fillB) {
    return; // Already the same color
  }

  const pixelStack: Point[] = [{ x: startX, y: startY }];
  const visited = new Set<string>();

  while (pixelStack.length > 0) {
    const point = pixelStack.pop()!;
    const { x, y } = point;
    
    const key = `${x},${y}`;
    if (visited.has(key)) continue;
    visited.add(key);

    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;

    const pos = (y * canvas.width + x) * 4;
    const r = pixels[pos];
    const g = pixels[pos + 1];
    const b = pixels[pos + 2];
    const a = pixels[pos + 3];

    if (r === startR && g === startG && b === startB && a === startA) {
      pixels[pos] = fillR;
      pixels[pos + 1] = fillG;
      pixels[pos + 2] = fillB;
      pixels[pos + 3] = 255;

      pixelStack.push({ x: x + 1, y });
      pixelStack.push({ x: x - 1, y });
      pixelStack.push({ x, y: y + 1 });
      pixelStack.push({ x, y: y - 1 });
    }
  }

  ctx.putImageData(imageData, 0, 0);
}
