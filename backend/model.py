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
_model_type = None  # "keras" or "savedmodel"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Download model files from HuggingFace if not present locally
# Priority: ResNet model (higher accuracy) > original CNN > fallback
HF_FILES = {
    "resnet_mnist_digits.hdf5": os.getenv("HF_RESNET_MODEL_URL"),
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

# Search for model files in order of priority (ResNet first)
model_paths = [
    os.path.join(BASE_DIR, "resnet_mnist_digits.hdf5"),
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
                _model_type = "keras"
                print(f"Loaded Keras model from {path}")
                break
            except Exception as e:
                try:
                    # Fallback to saved_model if keras fails
                    _model = tf.saved_model.load(path)
                    _model_type = "savedmodel"
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
    
    # Convert to grayscale
    img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # --- Contrast Enhancement (CLAHE) ---
    # Normalizes local contrast, helps with faint or uneven writing
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img_gray = clahe.apply(img_gray)
    
    # --- Denoising ---
    # Gaussian blur removes high-frequency noise before thresholding
    img_blur = cv2.GaussianBlur(img_gray, (3, 3), 0)
    
    # --- Adaptive Binarization ---
    # Otsu's method automatically finds optimal threshold;
    # produces clean black-and-white image regardless of lighting
    _, img_bin = cv2.threshold(
        img_blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )
    
    # --- Invert so digit is white on black (MNIST convention) ---
    img_inv = cv2.bitwise_not(img_bin)
    
    # --- Morphological Cleanup ---
    # Opening removes small noise specks; closing fills small gaps in strokes
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    img_inv = cv2.morphologyEx(img_inv, cv2.MORPH_OPEN, kernel, iterations=1)
    img_inv = cv2.morphologyEx(img_inv, cv2.MORPH_CLOSE, kernel, iterations=1)
    
    # --- Contour-based Digit Isolation ---
    # Crop to bounding box of the largest contour (the digit),
    # removing background waste and ensuring the digit fills the frame
    contours, _ = cv2.findContours(
        img_inv, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )
    if contours:
        largest_contour = max(contours, key=cv2.contourArea)
        x, y, w, h = cv2.boundingRect(largest_contour)
        # Add small padding to avoid clipping edges
        pad = max(2, int(0.05 * max(w, h)))
        x = max(0, x - pad)
        y = max(0, y - pad)
        w = min(img_inv.shape[1] - x, w + 2 * pad)
        h = min(img_inv.shape[0] - y, h + 2 * pad)
        img_inv = img_inv[y:y+h, x:x+w]
    
    # --- Centering ---
    # MNIST digits are centered in a square frame;
    # place the digit at the center of a square canvas preserving aspect ratio
    h, w = img_inv.shape
    side = max(h, w)
    canvas = np.zeros((side, side), dtype=np.uint8)
    y_offset = (side - h) // 2
    x_offset = (side - w) // 2
    canvas[y_offset:y_offset+h, x_offset:x_offset+w] = img_inv
    
    # --- Resize to 28x28 ---
    # INTER_CUBIC gives sharper results than INTER_AREA for downscaling
    img_resized = cv2.resize(canvas, (28, 28), interpolation=cv2.INTER_CUBIC)
    
    # --- Normalize to [0, 1] ---
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
    if _model_type == "keras" and hasattr(_model, "predict"):
        predictions = _model.predict(processed_img)
    else:
        # SavedModel fallback — auto-detect output key
        infer = _model.signatures["serving_default"]
        output = infer(tf.constant(processed_img))
        # Use the first (and usually only) output key instead of hardcoding
        output_key = list(output.keys())[0]
        predictions = output[output_key].numpy()
    
    digit = int(np.argmax(predictions[0]))
    confidence = float(predictions[0][digit])
    raw_scores = {str(i): float(predictions[0][i]) for i in range(10)}
    
    return digit, confidence, raw_scores


def _segment_digits(image_bytes: bytes) -> list[np.ndarray]:
    """Segment a multi-digit image into individual digit images (28x28x1 each)."""
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image format")

    # Same preprocessing as single-digit up to binarization
    img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img_gray = clahe.apply(img_gray)

    img_blur = cv2.GaussianBlur(img_gray, (3, 3), 0)

    _, img_bin = cv2.threshold(
        img_blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU
    )

    img_inv = cv2.bitwise_not(img_bin)

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    img_inv = cv2.morphologyEx(img_inv, cv2.MORPH_CLOSE, kernel, iterations=1)
    img_inv = cv2.morphologyEx(img_inv, cv2.MORPH_OPEN, kernel, iterations=1)

    # Find all external contours (one per digit)
    contours, _ = cv2.findContours(
        img_inv, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE
    )

    if not contours:
        raise HTTPException(status_code=400, detail="No digits found in image")

    # Filter out tiny noise contours (area too small)
    min_area = 0.005 * img_inv.shape[0] * img_inv.shape[1]
    digit_contours = [c for c in contours if cv2.contourArea(c) > min_area]

    if not digit_contours:
        raise HTTPException(status_code=400, detail="No digits found in image")

    # Sort contours left-to-right by x coordinate
    digit_contours.sort(key=lambda c: cv2.boundingRect(c)[0])

    digit_images = []
    for contour in digit_contours:
        x, y, w, h = cv2.boundingRect(contour)

        # Add padding
        pad = max(2, int(0.05 * max(w, h)))
        x1 = max(0, x - pad)
        y1 = max(0, y - pad)
        x2 = min(img_inv.shape[1], x + w + pad)
        y2 = min(img_inv.shape[0], y + h + pad)

        digit_crop = img_inv[y1:y2, x1:x2]

        # Center on square canvas (same as single-digit)
        ch, cw = digit_crop.shape
        side = max(ch, cw)
        canvas = np.zeros((side, side), dtype=np.uint8)
        y_offset = (side - ch) // 2
        x_offset = (side - cw) // 2
        canvas[y_offset:y_offset + ch, x_offset:x_offset + cw] = digit_crop

        # Resize to 28x28 and normalize
        img_resized = cv2.resize(canvas, (28, 28), interpolation=cv2.INTER_CUBIC)
        img_norm = img_resized.astype(np.float32) / 255.0
        digit_images.append(img_norm.reshape(28, 28, 1))

    return digit_images


def predict_multi(image_bytes: bytes) -> tuple[str, float, list[dict]]:
    """Predict multiple digits from a single image.
    Returns (number_string, avg_confidence, list_of_per_digit_results).
    Each per-digit result: {"digit": int, "confidence": float, "raw_scores": dict}
    """
    if _model is None:
        raise HTTPException(
            status_code=503,
            detail="ML Model not available. Please ensure model files are correctly placed in the backend directory."
        )

    digit_images = _segment_digits(image_bytes)

    # Batch predict all digits at once for efficiency
    batch = np.array(digit_images)  # shape: (N, 28, 28, 1)

    if _model_type == "keras" and hasattr(_model, "predict"):
        predictions = _model.predict(batch)
    else:
        infer = _model.signatures["serving_default"]
        output = infer(tf.constant(batch))
        output_key = list(output.keys())[0]
        predictions = output[output_key].numpy()

    results = []
    digits = []
    for i in range(len(digit_images)):
        digit = int(np.argmax(predictions[i]))
        confidence = float(predictions[i][digit])
        raw_scores = {str(j): float(predictions[i][j]) for j in range(10)}
        digits.append(digit)
        results.append({
            "digit": digit,
            "confidence": round(confidence, 4),
            "raw_scores": raw_scores
        })

    number_str = "".join(str(d) for d in digits)
    avg_confidence = float(np.mean([r["confidence"] for r in results]))

    return number_str, round(avg_confidence, 4), results
