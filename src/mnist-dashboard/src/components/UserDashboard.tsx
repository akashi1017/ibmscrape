import { useState, useRef, useEffect } from "react";
import { Eraser, Send, TrendingUp, Clock, Upload, Pencil } from "lucide-react";
import { DigitCanvas } from "./DigitCanvas";
import { PredictionResults } from "./PredictionResults";
import { RecentPredictions } from "./RecentPredictions";
import { ImageUpload } from "./ImageUpload";

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

const HISTORY_STORAGE_KEY = "mnist-prediction-history";
const MAX_HISTORY = 10;

function loadHistoryFromStorage(): PredictionHistory[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .slice(0, MAX_HISTORY)
      .map((item: { id?: string; timestamp?: string; prediction?: number; confidence?: number; imageData?: string }) => ({
        id: String(item.id ?? ""),
        timestamp: item.timestamp ? new Date(item.timestamp) : new Date(0),
        prediction: Number(item.prediction ?? 0),
        confidence: Number(item.confidence ?? 0),
        imageData: String(item.imageData ?? ""),
      }))
      .filter((item) => item.id && item.imageData);
  } catch {
    return [];
  }
}

function saveHistoryToStorage(history: PredictionHistory[]) {
  try {
    const toSave = history.slice(0, MAX_HISTORY).map((item) => ({
      ...item,
      timestamp: item.timestamp.toISOString(),
    }));
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // ignore quota or other storage errors
  }
}

export function UserDashboard() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [history, setHistory] = useState<PredictionHistory[]>(loadHistoryFromStorage);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'draw' | 'upload'>('draw');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handlePredict = () => {
    const imageData = mode === 'draw' 
      ? canvasRef.current?.toDataURL() 
      : uploadedImage;
    
    if (!imageData) return;
    
    setIsProcessing(true);
    
    // Simulate ML model prediction
    setTimeout(() => {
      const mockPredictions: Prediction[] = [
        { digit: Math.floor(Math.random() * 10), confidence: 0.85 + Math.random() * 0.14 },
        { digit: Math.floor(Math.random() * 10), confidence: 0.05 + Math.random() * 0.15 },
        { digit: Math.floor(Math.random() * 10), confidence: 0.01 + Math.random() * 0.08 },
      ].sort((a, b) => b.confidence - a.confidence);

      setPredictions(mockPredictions);
      
      // Add to history
      const newHistory: PredictionHistory = {
        id: Date.now().toString(),
        timestamp: new Date(),
        prediction: mockPredictions[0].digit,
        confidence: mockPredictions[0].confidence,
        imageData: imageData,
      };
      
      setHistory(prev => [newHistory, ...prev].slice(0, 10));
      setIsProcessing(false);
    }, 800);
  };

  const handleClear = () => {
    setPredictions([]);
    if (mode === 'upload') {
      setUploadedImage(null);
    }
  };

  const handleImageUpload = (dataUrl: string) => {
    setUploadedImage(dataUrl);
    setPredictions([]);
  };

  useEffect(() => {
    saveHistoryToStorage(history);
  }, [history]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
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
                {/* Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1 ml-4">
                  <button
                    onClick={() => setMode('draw')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                      mode === 'draw' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Pencil className="size-4" />
                    Draw
                  </button>
                  <button
                    onClick={() => setMode('upload')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
                      mode === 'upload' 
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
              <h2 className="text-xl font-semibold text-gray-900">Recent Predictions</h2>
            </div>
            <RecentPredictions history={history} />
          </div>
        </div>

        {/* Prediction Results */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="size-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Predictions</h2>
            </div>
            <PredictionResults predictions={predictions} isLoading={isProcessing} />
          </div>
        </div>
      </div>
    </div>
  );
}