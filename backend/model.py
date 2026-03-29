import os
import urllib.request
import numpy as np
import cv2
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

try:
    import tensorflow as tf
except ImportError:
    tf = None

_model = None
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Download model files from HuggingFace if not present locally
HF_FILES = {
    "best_mnist_cnn.keras": os.getenv("HF_MODEL_URL"),
    "best_model.pb": os.getenv("HF_FALLBACK_URL"),
}

def download_models():
    for filename, url in HF_FILES.items():
        dest = os.path.join(BASE_DIR, filename)
        if not os.path.exists(dest):
            if url:
                print(f"Downloading {filename} from HuggingFace...")
                try:
                    urllib.request.urlretrieve(url, dest)
                    print(f"Downloaded {filename} successfully.")
                except Exception as e:
                    print(f"Warning: Could not download {filename}: {e}")
            else:
                print(f"Warning: No URL set for {filename}, skipping download.")
        else:
            print(f"{filename} already exists, skipping download.")

download_models()

# Search for model files in order of priority
model_paths = [
    os.path.join(BASE_DIR, "best_mnist_cnn.keras"),
    os.path.join(BASE_DIR, "best_model.pb"),
    BASE_DIR  # Assuming SavedModel directory
]

if tf:
    for path in model_paths:
        if os.path.exists(path):
            try:
                # Try loading as keras model first
                _model = tf.keras.models.load_model(path)
                print(f"Loaded model from {path}")
                break
            except Exception as e:
                try:
                    # Fallback to saved_model if keras fails
                    _model = tf.saved_model.load(path)
                    print(f"Loaded SavedModel from {path}")
                    break
                except Exception as e2:
                    print(f"Warning: Failed to load model from {path}: {e2}")
    
    if _model is None:
        print("Warning: No valid model file found in backend directory.")
else:
    print("Warning: TensorFlow not installed. Predictions will fail.")

def _preprocess(image_bytes: bytes) -> np.ndarray:
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image format")
        
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    
    img_inv = cv2.bitwise_not(img_gray)
    img_resized = cv2.resize(img_inv, (28, 28), interpolation=cv2.INTER_AREA)
    
    img_norm = img_resized.astype(np.float32) / 255.0
    return img_norm.reshape(1, 28, 28, 1)

def predict(image_bytes: bytes) -> tuple[int, float, dict]:
    if _model is None:
        raise HTTPException(
            status_code=503, 
            detail="ML Model not available. Please ensure model files are correctly placed in the backend directory."
        )
        
    processed_img = _preprocess(image_bytes)
    
    # Handle different model types (Keras vs SavedModel)
    if hasattr(_model, "predict"):
        predictions = _model.predict(processed_img)
    else:
        # SavedModel fallback
        infer = _model.signatures["serving_default"]
        predictions = infer(tf.constant(processed_img))["dense_2"].numpy() # Adjust output key if needed
    
    digit = int(np.argmax(predictions[0]))
    confidence = float(predictions[0][digit])
    raw_scores = {str(i): float(predictions[0][i]) for i in range(10)}
    
    return digit, confidence, raw_scores
