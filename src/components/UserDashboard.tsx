import { useState, useRef, useEffect } from "react";
import { Eraser, Send, TrendingUp, Clock, Upload, Pencil, AlertCircle } from "lucide-react";
import { DigitCanvas } from "./DigitCanvas";
import { PredictionResults } from "./PredictionResults";
import { RecentPredictions } from "./RecentPredictions";
import { ImageUpload } from "./ImageUpload";
import API_BASE from "../config";

export interface Prediction {
  digit: number;
  confidence: number;
}

export interface PredictionHistory {
  id: string;
  timestamp: Date;
  prediction: number;
  confidence: number;
  imageData: string;
}

export function UserDashboard() {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [history, setHistory] = useState<PredictionHistory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const userName = localStorage.getItem("mnist-auth-name") || "there";
  const token = localStorage.getItem("mnist-auth-token");

  // Load prediction history from backend (user-scoped via JWT)
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/history`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((data: Array<{ id: number; predicted_digit: number; confidence: number; created_at: string; image_path?: string }>) => {
        const mapped: PredictionHistory[] = data.map((item) => ({
          id: String(item.id),
          timestamp: new Date(item.created_at),
          prediction: item.predicted_digit,
          confidence: item.confidence,
          // Backend stores the image path; build a URL or use empty string
          imageData: item.image_path
            ? `${API_BASE}/${item.image_path}`
            : "",
        }));
        setHistory(mapped);
      })
      .catch(() => setHistory([]));
  }, [token]);

  const handlePredict = async () => {
    setErrorMessage(null);
    setPrediction(null);

    let imageBlob: Blob | null = null;
    let previewDataUrl: string | null = null;

    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      previewDataUrl = canvas.toDataURL("image/png");
      await new Promise<void>((resolve) => {
        canvas.toBlob((blob) => {
          imageBlob = blob;
          resolve();
        }, "image/png");
      });
    } else {
      if (!uploadedImage) return;
      previewDataUrl = uploadedImage;
      const res = await fetch(uploadedImage);
      imageBlob = await res.blob();
    }

    if (!imageBlob) {
      setErrorMessage("Could not read image. Please try again.");
      return;
    }

    if (!token) {
      setErrorMessage("You are not logged in. Please log in and try again.");
      return;
    }

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("file", imageBlob, "digit.png");

      const response = await fetch(`${API_BASE}/api/predict`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `Server error: ${response.status}` }));
        let detail = errorData.detail;
        if (Array.isArray(detail)) {
          detail = detail.map((d: any) => d.msg ?? JSON.stringify(d)).join("; ");
        } else if (typeof detail === "object" && detail !== null) {
          detail = JSON.stringify(detail);
        }
        throw new Error(detail ?? `Request failed with status ${response.status}`);
      }

      const data = await response.json();
      const result: Prediction = {
        digit: data.predicted_digit,
        confidence: data.confidence,
      };

      setPrediction(result);

      // Add to the top of history list (don't need to re-fetch)
      const newEntry: PredictionHistory = {
        id: String(data.id),
        timestamp: new Date(data.created_at),
        prediction: result.digit,
        confidence: result.confidence,
        imageData: previewDataUrl ?? "",
      };
      setHistory(prev => [newEntry, ...prev].slice(0, 20));
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setPrediction(null);
    setErrorMessage(null);
    if (mode === 'upload') {
      setUploadedImage(null);
    }
  };

  const handleImageUpload = (dataUrl: string) => {
    setUploadedImage(dataUrl);
    setPrediction(null);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <p className="text-sm font-medium text-blue-600 mb-1">Welcome back, {userName} 👋</p>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Digit Recognition</h1>
        <p className="text-gray-600">Draw a digit or upload an image to see the model's prediction</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drawing Canvas / Upload Area */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-gray-900">
                  {mode === 'draw' ? 'Draw Here' : 'Upload Image'}
                </h2>
                <div className="flex bg-gray-100 rounded-lg p-1 ml-4">
                  <button
                    onClick={() => setMode('draw')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${mode === 'draw'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    <Pencil className="size-4" />
                    Draw
                  </button>
                  <button
                    onClick={() => setMode('upload')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${mode === 'upload'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                      }`}
                  >
                    <Upload className="size-4" />
                    Upload
                  </button>
                </div>
              </div>
              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Eraser className="size-4" />
                Clear
              </button>
            </div>

            {mode === 'draw' ? (
              <DigitCanvas ref={canvasRef} onClear={handleClear} />
            ) : (
              <ImageUpload onImageUpload={handleImageUpload} uploadedImage={uploadedImage} />
            )}

            <button
              onClick={handlePredict}
              disabled={isProcessing}
              className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="size-5" />
                  Predict Digit
                </>
              )}
            </button>
          </div>

          {/* Recent Predictions */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="size-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">My Recent Predictions</h2>
            </div>
            <RecentPredictions history={history} />
          </div>
        </div>

        {/* Prediction Results */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="size-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Result</h2>
            </div>

            {errorMessage && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                <AlertCircle className="size-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            )}

            <PredictionResults prediction={prediction} isLoading={isProcessing} />
          </div>
        </div>
      </div>
    </div>
  );
}