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
      ctx.lineWidth = 14;
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
      ctx.lineWidth = isErasing ? 26 : 14;
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
      ctx.lineWidth = isErasing ? 26 : 14;
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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <canvas
          ref={attachRef}
          width={280}
          height={280}
          style={{ borderRadius: "var(--dg-radius)", border: "1px solid var(--dg-border)", cursor: isErasing ? "cell" : "crosshair", touchAction: "none", background: "white", display: "block" }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <div style={{ display: "flex", gap: 6, alignSelf: "flex-end" }}>
          <button
            type="button"
            onClick={() => setIsErasing((v) => !v)}
            className="btn-ghost btn-sm"
            style={isErasing ? { borderColor: "var(--dg-accent)", color: "var(--dg-accent)" } : {}}
            title="Toggle eraser"
          >
            <EraserIcon size={14} />
            {isErasing ? "Eraser on" : "Eraser"}
          </button>
          <button
            type="button"
            onClick={clearCanvas}
            className="btn-ghost btn-sm"
            title="Clear canvas"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>
    );
  }
);

DigitCanvas.displayName = "DigitCanvas";
