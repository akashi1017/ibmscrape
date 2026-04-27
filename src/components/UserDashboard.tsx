import { useState, useRef, useEffect } from "react";
import { Eraser, Send, TrendingUp, Clock, Upload, Pencil, AlertCircle } from "lucide-react";
import { DigitCanvas } from "./DigitCanvas";
import { PredictionResults } from "./PredictionResults";
import { RecentPredictions } from "./RecentPredictions";
import { ImageUpload } from "./ImageUpload";
import API_BASE from "../config";

export interface DigitConfidence {
  digit: number;
  confidence: number;
}

export interface MultiDigitPrediction {
  predicted_value: string;
  confidence: number;
  digit_count: number;
  per_digit_confidences: DigitConfidence[];
}

export interface PredictionHistory {
  id: string;
  timestamp: Date;
  predicted_value: string;
  confidence: number;
  per_digit_confidences: DigitConfidence[];
  imageData: string;
}

export function UserDashboard() {
  const [prediction, setPrediction] = useState<MultiDigitPrediction | null>(null);
  const [history, setHistory] = useState<PredictionHistory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<"draw" | "upload">("draw");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const token = localStorage.getItem("mnist-auth-token");

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/history?limit=20`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then((data: Array<{
        id: number; predicted_value: string; confidence: number;
        per_digit_confidences: DigitConfidence[] | null;
        created_at: string; image_path?: string;
      }>) => {
        setHistory(data.map(item => ({
          id: String(item.id),
          timestamp: new Date(item.created_at),
          predicted_value: item.predicted_value,
          confidence: item.confidence,
          per_digit_confidences: item.per_digit_confidences ?? [],
          imageData: item.image_path ? `${API_BASE}/${item.image_path}` : "",
        })));
      })
      .catch(() => setHistory([]));
  }, [token]);

  const handlePredict = async () => {
    setErrorMessage(null);
    setPrediction(null);

    let imageBlob: Blob | null = null;
    let previewDataUrl: string | null = null;

    if (mode === "draw") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      previewDataUrl = canvas.toDataURL("image/png");
      await new Promise<void>(resolve => {
        canvas.toBlob(blob => { imageBlob = blob; resolve(); }, "image/png");
      });
    } else {
      if (!uploadedFile || !uploadedImage) return;
      previewDataUrl = uploadedImage;
      imageBlob = uploadedFile;
    }

    if (!imageBlob) { setErrorMessage("Could not read image. Please try again."); return; }
    if (!token) { setErrorMessage("You are not logged in."); return; }

    setIsProcessing(true);
    try {
      const formData = new FormData();
      const filename = imageBlob instanceof File ? imageBlob.name : "digit.png";
      formData.append("file", imageBlob, filename);
      formData.append("source", mode);  // "draw" | "upload" — backend routes to ResNet vs Groq

      const response = await fetch(`${API_BASE}/api/predict`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `Server error: ${response.status}` }));
        let detail = errorData.detail;
        if (Array.isArray(detail)) detail = detail.map((d: any) => d.msg ?? JSON.stringify(d)).join(";");
        else if (typeof detail === "object" && detail !== null) detail = JSON.stringify(detail);
        throw new Error(detail ?? `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      const result: MultiDigitPrediction = {
        predicted_value: data.predicted_value,
        confidence: data.confidence,
        digit_count: data.digit_count,
        per_digit_confidences: data.per_digit_confidences ?? [],
      };
      setPrediction(result);

      setHistory(prev => [{
        id: String(data.id),
        timestamp: new Date(data.created_at),
        predicted_value: result.predicted_value,
        confidence: result.confidence,
        per_digit_confidences: result.per_digit_confidences,
        imageData: previewDataUrl ?? "",
      }, ...prev].slice(0, 20));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setPrediction(null);
    setErrorMessage(null);
    if (mode === "upload") {
      setUploadedImage(null);
      setUploadedFile(null);
    }
  };

  return (
    <div>
      {/* Section header */}
      <div className="dg-section-header">
        <div>
          <h1 className="dg-section-title">Digit Recognition</h1>
          <p className="dg-section-subtitle">Draw or upload digits to see the model's prediction</p>
        </div>
      </div>

      <div className="dg-predict-grid">
        {/* Left: input area */}
        <div>
          <div className="dg-card">
            <div className="dg-card-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <h3 className="dg-card-title">
                  {mode === "draw" ? "Draw here" : "Upload image"}
                </h3>
                <div className="dg-toggle-group">
                  <button
                    className={`dg-toggle-btn${mode === "draw" ? " dg-toggle-btn--active" : ""}`}
                    onClick={() => setMode("draw")}
                  >
                    <Pencil size={14} /> Draw
                  </button>
                  <button
                    className={`dg-toggle-btn${mode === "upload" ? " dg-toggle-btn--active" : ""}`}
                    onClick={() => setMode("upload")}
                  >
                    <Upload size={14} /> Upload
                  </button>
                </div>
              </div>
              <button className="btn-ghost" onClick={handleClear}>
                <Eraser size={16} /> Clear
              </button>
            </div>

            {mode === "draw" ? (
              <DigitCanvas ref={canvasRef} onClear={handleClear} />
            ) : (
              <ImageUpload onImageUpload={(img, file) => { setUploadedImage(img); setUploadedFile(file); setPrediction(null); setErrorMessage(null); }} uploadedImage={uploadedImage} />
            )}

            <button
              className="btn-primary btn-full"
              onClick={handlePredict}
              disabled={isProcessing}
              style={{ marginTop: 16 }}
            >
              {isProcessing ? (
                <><span className="dg-spinner" /> Processing…</>
              ) : (
                <><Send size={18} /> Predict</>
              )}
            </button>
          </div>

          {/* Recent predictions */}
          <div className="dg-card" style={{ marginTop: 16 }}>
            <div className="dg-card-header">
              <h3 className="dg-card-title">
                <Clock size={16} style={{ opacity: 0.5 }} /> Recent predictions
              </h3>
            </div>
            <RecentPredictions history={history} />
          </div>
        </div>

        {/* Right: result panel */}
        <div>
          <div className="dg-card dg-card--sticky">
            <div className="dg-card-header">
              <h3 className="dg-card-title">
                <TrendingUp size={16} style={{ color: "var(--dg-accent)" }} /> Result
              </h3>
            </div>

            {errorMessage && (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px", background: "#ef444418", border: "1px solid #ef444430", borderRadius: "var(--dg-radius)", marginBottom: 12 }}>
                <AlertCircle size={16} style={{ color: "var(--dg-red)", flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 13, color: "var(--dg-red)" }}>{errorMessage}</p>
              </div>
            )}

            <PredictionResults prediction={prediction} isLoading={isProcessing} />
          </div>
        </div>
      </div>
    </div>
  );
}
