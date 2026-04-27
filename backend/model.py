import os
import json
import base64
import urllib.request
import urllib.error
import numpy as np
import cv2
from fastapi import HTTPException
from dotenv import load_dotenv

load_dotenv()

try:
    import tensorflow as tf
except ImportError:
    tf = None

# ──────────────────────────────────────────────────────────────────
#  Configuration
# ──────────────────────────────────────────────────────────────────
_model = None
_model_type = None  # "keras" or "savedmodel"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Groq Vision API (free tier: 30 RPM, ~14k RPD)
USE_VISION_API = os.getenv("USE_VISION_API", "false").lower() == "true"
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_VISION_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct")

HF_FILES = {
    "resnet_mnist_digits.hdf5": os.getenv("HF_RESNET_MODEL_URL"),
    "best_mnist_cnn.keras": os.getenv("HF_MODEL_URL"),
    "best_model.pb": os.getenv("HF_FALLBACK_URL"),
}


def download_models():
    for filename, url in HF_FILES.items():
        dest = os.path.join(BASE_DIR, filename)
        if os.path.exists(dest):
            print(f"{filename} already exists, skipping download.")
            continue
        if not url:
            print(f"Warning: No URL set for {filename}, skipping download.")
            continue
        print(f"Downloading {filename} from HuggingFace...")
        try:
            urllib.request.urlretrieve(url, dest)
            print(f"Downloaded {filename} successfully.")
        except Exception as e:
            print(f"Warning: Could not download {filename}: {e}")


download_models()

model_paths = [
    os.path.join(BASE_DIR, "resnet_mnist_digits.hdf5"),
    os.path.join(BASE_DIR, "best_mnist_cnn.keras"),
    os.path.join(BASE_DIR, "best_model.pb"),
    BASE_DIR,
]

if tf:
    for path in model_paths:
        if not os.path.exists(path):
            continue
        try:
            _model = tf.keras.models.load_model(path)
            _model_type = "keras"
            print(f"Loaded Keras model from {path}")
            break
        except Exception:
            try:
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


# ══════════════════════════════════════════════════════════════════
#  PREPROCESSING (simple, MNIST-friendly)
# ══════════════════════════════════════════════════════════════════

def _segment_digits(image_bytes: bytes) -> list[np.ndarray]:
    """Segment a multi-digit image into 28×28×1 per-digit crops.

    Pipeline (kept deliberately simple; complex preprocessing was harming
    photographed digits more than it helped):
      grayscale → CLAHE → Gaussian blur → Otsu threshold → invert
      → morph close+open → external contours → left-to-right sort
      → per-digit pad-to-square + 28×28 + normalize.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image format")

    # Cap working resolution so min_area stays reasonable on huge phone photos
    h, w = img.shape[:2]
    max_dim = 1200
    if max(h, w) > max_dim:
        scale = max_dim / max(h, w)
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

    img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img_gray = clahe.apply(img_gray)

    img_blur = cv2.GaussianBlur(img_gray, (3, 3), 0)

    _, img_bin = cv2.threshold(img_blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    img_inv = cv2.bitwise_not(img_bin)

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    img_inv = cv2.morphologyEx(img_inv, cv2.MORPH_CLOSE, kernel, iterations=1)
    img_inv = cv2.morphologyEx(img_inv, cv2.MORPH_OPEN, kernel, iterations=1)

    contours, _ = cv2.findContours(img_inv, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not contours:
        raise HTTPException(status_code=400, detail="No digits found in image")

    min_area = 0.005 * img_inv.shape[0] * img_inv.shape[1]
    digit_contours = [c for c in contours if cv2.contourArea(c) > min_area]
    if not digit_contours:
        raise HTTPException(status_code=400, detail="No digits found in image")

    digit_contours.sort(key=lambda c: cv2.boundingRect(c)[0])

    digit_images = []
    for contour in digit_contours:
        x, y, cw, ch = cv2.boundingRect(contour)
        pad = max(2, int(0.05 * max(cw, ch)))
        x1 = max(0, x - pad)
        y1 = max(0, y - pad)
        x2 = min(img_inv.shape[1], x + cw + pad)
        y2 = min(img_inv.shape[0], y + ch + pad)
        digit_crop = img_inv[y1:y2, x1:x2]

        # Center on a square canvas
        dh, dw = digit_crop.shape
        side = max(dh, dw)
        canvas = np.zeros((side, side), dtype=np.uint8)
        y_off = (side - dh) // 2
        x_off = (side - dw) // 2
        canvas[y_off:y_off + dh, x_off:x_off + dw] = digit_crop

        img_resized = cv2.resize(canvas, (28, 28), interpolation=cv2.INTER_CUBIC)
        img_norm = img_resized.astype(np.float32) / 255.0
        digit_images.append(img_norm.reshape(28, 28, 1))

    return digit_images


def _resnet_predict(image_bytes: bytes) -> tuple[str, float, list[dict]]:
    """Run the local ResNet on a multi-digit image."""
    digit_images = _segment_digits(image_bytes)
    batch = np.array(digit_images)

    if _model_type == "keras" and hasattr(_model, "predict"):
        predictions = _model.predict(batch, verbose=0)
    else:
        infer = _model.signatures["serving_default"]
        output = infer(tf.constant(batch))
        output_key = list(output.keys())[0]
        predictions = output[output_key].numpy()

    results = []
    digits = []
    for i in range(len(digit_images)):
        d = int(np.argmax(predictions[i]))
        c = float(predictions[i][d])
        digits.append(d)
        results.append({"digit": d, "confidence": round(c, 4)})

    number_str = "".join(str(d) for d in digits)
    avg_conf = float(np.mean([r["confidence"] for r in results]))
    return number_str, round(avg_conf, 4), results


# ══════════════════════════════════════════════════════════════════
#  GROQ VISION API
# ══════════════════════════════════════════════════════════════════

import re

GROQ_SYSTEM = (
    "You are a digit-reading API. You receive an image of handwritten digits and "
    "must respond with ONLY a JSON object — no prose, no explanation, no markdown. "
    'Format: {"digits":"<digits>","confidence":<0.0-1.0>}. '
    'Example valid response: {"digits":"3412","confidence":0.95}'
)

GROQ_PROMPT = (
    "Read all handwritten digits in this image left-to-right. "
    'Reply with ONLY: {"digits":"<concatenated digits>","confidence":<0-1>}. '
    "No other text."
)


def _parse_groq_response(text: str) -> tuple[str, float]:
    """Extract digits + confidence from Groq's reply.

    Accepts strict JSON, JSON wrapped in code fences, or plain prose
    ("The digits are 3, 4, 1, 2."). Falls back to scraping every digit
    from the text in order if no JSON is parseable.
    """
    text = text.strip().replace("```json", "").replace("```", "").strip()

    # 1. Strict JSON
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        parsed = None

    # 2. JSON object embedded somewhere in the text
    if parsed is None:
        match = re.search(r"\{[^{}]*\}", text, re.DOTALL)
        if match:
            try:
                parsed = json.loads(match.group(0))
            except json.JSONDecodeError:
                parsed = None

    if parsed is not None:
        digits = "".join(c for c in str(parsed.get("digits", "")) if c.isdigit())
        try:
            conf = float(parsed.get("confidence", 0.9))
        except (TypeError, ValueError):
            conf = 0.9
        if digits:
            return digits, max(0.0, min(1.0, conf))

    # 3. Last resort: extract every digit character in order from the response.
    # Handles "The digits are 3, 4, 1, and 2." → "3412"
    digits = "".join(c for c in text if c.isdigit())
    if not digits:
        raise ValueError(f"No digits found in Groq response: {text[:200]}")
    # No explicit confidence — assume high since the model produced an answer
    return digits, 0.9


def _predict_groq(image_bytes: bytes) -> tuple[str, float]:
    """Call Groq Llama Vision API. Returns (digits_string, confidence)."""
    import time
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY not configured")

    b64 = base64.b64encode(image_bytes).decode("utf-8")
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": GROQ_SYSTEM},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": GROQ_PROMPT},
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{b64}"}},
                ],
            },
        ],
        "temperature": 0.0,
        "max_tokens": 80,
    }

    max_retries = 2
    for attempt in range(max_retries + 1):
        req = urllib.request.Request(
            "https://api.groq.com/openai/v1/chat/completions",
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                text = result["choices"][0]["message"]["content"]
                return _parse_groq_response(text)
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < max_retries:
                time.sleep(2 * (attempt + 1))
                continue
            # Surface Groq's actual error body so we can see what's wrong
            body = e.read().decode("utf-8", errors="replace")[:500]
            raise RuntimeError(f"Groq HTTP {e.code}: {body}") from e
    
    raise RuntimeError("Groq API request failed after retries")


# ══════════════════════════════════════════════════════════════════
#  PUBLIC ENTRY: predict_multi
# ══════════════════════════════════════════════════════════════════

def predict_multi(image_bytes: bytes, prefer_vision: bool = False) -> tuple[str, float, list[dict], str]:
    """Predict the number in a multi-digit image.

    prefer_vision=True (uploaded photos): try Groq first, fall back to ResNet.
    prefer_vision=False (canvas drawings): use ResNet directly.

    Returns: (number_string, avg_confidence, per_digit_results, source)
      where source ∈ {"resnet", "groq", "groq_fallback_resnet"}
    """
    groq_available = USE_VISION_API and bool(GROQ_API_KEY)

    # ── Path A: Upload — Groq primary ──
    if prefer_vision and groq_available:
        try:
            digits, conf = _predict_groq(image_bytes)
            if digits:
                results = [{"digit": int(d), "confidence": round(conf, 4)} for d in digits]
                print(f"[Groq] Predicted: {digits} (confidence: {conf:.4f})")
                return digits, round(conf, 4), results, "groq"
            print("[Groq] Returned no digits, falling back to ResNet")
        except Exception as e:
            print(f"[Groq] Failed ({e}), falling back to ResNet")

        if _model is None:
            raise HTTPException(
                status_code=503,
                detail="Vision API failed and local ResNet is unavailable.",
            )
        try:
            number_str, avg_conf, results = _resnet_predict(image_bytes)
            print(f"[ResNet fallback] Predicted: {number_str} (avg confidence: {avg_conf:.4f})")
            return number_str, avg_conf, results, "groq_fallback_resnet"
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")

    # ── Path B: Canvas (or Groq disabled) — ResNet only ──
    if _model is None:
        raise HTTPException(
            status_code=503,
            detail="ML model not available. Check that model files were downloaded.",
        )
    try:
        number_str, avg_conf, results = _resnet_predict(image_bytes)
        print(f"[ResNet] Predicted: {number_str} (avg confidence: {avg_conf:.4f})")
        return number_str, avg_conf, results, "resnet"
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")
