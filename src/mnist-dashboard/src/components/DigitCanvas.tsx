import { forwardRef, useRef, useState, useEffect } from "react";
import { Eraser as EraserIcon, RotateCcw } from "lucide-react";

interface DigitCanvasProps {
  onClear: () => void;
}

export const DigitCanvas = forwardRef<HTMLCanvasElement, DigitCanvasProps>(
  ({ onClear }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isErasing, setIsErasing] = useState(false);

    // Attach both local and forwarded refs to the canvas
    const attachRef = (node: HTMLCanvasElement | null) => {
      canvasRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref && typeof ref === "object") {
        (ref as React.MutableRefObject<HTMLCanvasElement | null>).current = node;
      }
    };

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Initialize canvas background and stroke settings
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "black";
      ctx.lineWidth = 20;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }, []);

    const getPos = (
      e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
    ) => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const startDrawing = (
      e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
    ) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      setIsDrawing(true);
      const { x, y } = getPos(e);

      ctx.beginPath();
      ctx.lineWidth = isErasing ? 26 : 20;
      ctx.strokeStyle = isErasing ? "white" : "black";
      ctx.moveTo(x, y);
    };

    const draw = (
      e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
    ) => {
      if (!isDrawing) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { x, y } = getPos(e);
      ctx.lineWidth = isErasing ? 26 : 20;
      ctx.strokeStyle = isErasing ? "white" : "black";
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const stopDrawing = () => {
      setIsDrawing(false);
    };

    const clearCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.save();
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      onClear();
    };

    return (
      <div className="flex justify-center">
        <div className="relative">
          {/* Controls overlay */}
          <div className="absolute right-2 -top-10 flex gap-2">
            <button
              type="button"
              onClick={() => setIsErasing((v) => !v)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors border ${
                isErasing
                  ? "bg-white text-blue-600 border-blue-200 shadow-sm"
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
              }`}
              title="Toggle eraser"
            >
              <EraserIcon className="size-4" />
              {isErasing ? "Eraser" : "Draw"}
            </button>
            <button
              type="button"
              onClick={clearCanvas}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
              title="Clear canvas"
            >
              <RotateCcw className="size-4" />
              Clear
            </button>
          </div>

          <canvas
            ref={attachRef}
            width={280}
            height={280}
            className="border-2 border-gray-300 rounded-lg cursor-crosshair touch-none bg-white"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>
      </div>
    );
  }
);

DigitCanvas.displayName = "DigitCanvas";
