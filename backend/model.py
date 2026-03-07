import os
import random
import numpy as np
import cv2

try:
    import tensorflow as tf
except ImportError:
    tf = None

_model = None
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

keras_path = os.path.join(BASE_DIR, "best_mnist_cnn.keras")
saved_model_path = os.path.join(BASE_DIR, "saved_model.pb")

if tf:
    if os.path.exists(keras_path):
        try:
            _model = tf.keras.models.load_model(keras_path)
            print(f"Loaded Keras model from {keras_path}")
        except Exception as e:
            print(f"Warning: Failed to load keras model from {keras_path}: {e}")
    elif os.path.exists(saved_model_path) or os.path.exists(os.path.join(BASE_DIR, "variables")):
        try:
            _model = tf.keras.models.load_model(BASE_DIR)
            print(f"Loaded SavedModel from {BASE_DIR}")
        except Exception as e:
            print(f"Warning: Failed to load saved model from {BASE_DIR}: {e}")
    else:
        print("Warning: No model file found. Running in stub mode.")
else:
    print("Warning: TensorFlow not installed. Running in stub mode.")

def _preprocess(image_bytes: bytes) -> np.ndarray:
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img_gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)
    
    img_inv = cv2.bitwise_not(img_gray)
    img_resized = cv2.resize(img_inv, (28, 28), interpolation=cv2.INTER_AREA)
    
    img_norm = img_resized.astype(np.float32) / 255.0
    return img_norm.reshape(1, 28, 28, 1)

def predict(image_bytes: bytes) -> tuple[int, float, dict]:
    if _model is None:
        digit = random.randint(0, 9)
        confidence = random.uniform(0.7, 0.99)
        raw_scores = {str(i): random.random() for i in range(10)}
        return digit, float(confidence), raw_scores
        
    processed_img = _preprocess(image_bytes)
    predictions = _model.predict(processed_img)
    
    digit = int(np.argmax(predictions[0]))
    confidence = float(predictions[0][digit])
    raw_scores = {str(i): float(predictions[0][i]) for i in range(10)}
    
    return digit, confidence, raw_scores
