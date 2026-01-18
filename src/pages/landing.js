import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./landing.css";

const Landing = () => {
  const fileInputRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();
  const [cameraOn, setCameraOn] = useState(false);
  const navigate = useNavigate();

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Uploaded:", file);
      // later → send to backend
    }
  };

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    setCameraOn(true);
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      console.log("Captured image:", blob);
      // later → send to backend
    });
  };

  return (
    <div className="landing-container">
      <nav className="navbar">
        <h2>DigitAI</h2>
        <button onClick={() => navigate("/login")}>Logout</button>
      </nav>

      <section className="hero">
        <h1>Handwritten Digit Recognition</h1>
        <p>
          Upload or capture a handwritten digit and let our AI model predict the
          number using MNIST-trained deep learning.
        </p>
      </section>

      {/* ACTIONS */}
      <div className="actions">
        <button onClick={handleUploadClick}>Upload Image</button>
        <button onClick={startCamera}>Use Camera</button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          hidden
          onChange={handleFileChange}
        />
      </div>

      {/* CAMERA */}
      {cameraOn && (
        <div className="camera-box">
          <video ref={videoRef} autoPlay />
          <button onClick={captureImage}>Capture</button>
          <canvas ref={canvasRef} hidden />
        </div>
      )}

      {/* ABOUT MNIST */}
      <div className="about">
        <h2>What is MNIST?</h2>
        <p>
          MNIST (Modified National Institute of Standards and Technology) is a
          benchmark dataset containing 70,000 handwritten digit images (0–9).
          Each image is 28×28 pixels and labeled with the correct digit.
        </p>
        <p>
          This project uses a trained machine learning model to recognize and
          classify handwritten digits from user-uploaded images.
        </p>
      </div>
    </div>
  );
};

export default Landing;
