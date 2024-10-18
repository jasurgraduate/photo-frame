// Frame.js
import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage'; // Import the cropping function
import './App.css';

const Frame = () => {
    // eslint-disable-next-line
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedImage, setCroppedImage] = useState(null);
    const canvasRef = useRef(null);

    // Handle file input change
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(file);
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle cropping
    const onCropComplete = useCallback(async (croppedArea, croppedAreaPixels) => {
        try {
            const croppedImg = await getCroppedImg(preview, croppedAreaPixels);
            setCroppedImage(croppedImg);
        } catch (error) {
            console.error('Error cropping image:', error);
        }
    }, [preview]);

    // Handle download
    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (canvas && croppedImage) {
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = croppedImage;

            img.onload = () => {
                const imgWidth = img.naturalWidth;
                const imgHeight = img.naturalHeight;

                const canvasWidth = Math.max(imgWidth + imgWidth * 0.1, 400);
                const canvasHeight = (canvasWidth * 450) / 400;

                canvas.width = canvasWidth;
                canvas.height = canvasHeight;

                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);

                const padding = canvasHeight * 0.05;
                const imgX = (canvasWidth - imgWidth) / 2;
                const imgY = padding;

                ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);

                const link = document.createElement('a');
                link.download = 'camera-print.png';
                link.href = canvas.toDataURL('image/png', 1.0);
                link.click();
            };
        }
    };

    // Create a function to render the final preview with the white frame
    const renderFinalPreview = () => {
        if (!croppedImage) return null;

        const finalCanvas = document.createElement('canvas');
        const ctx = finalCanvas.getContext('2d');
        const img = new Image();
        img.src = croppedImage;

        img.onload = () => {
            const imgWidth = img.naturalWidth;
            const imgHeight = img.naturalHeight;

            const canvasWidth = Math.max(imgWidth + imgWidth * 0.1, 400);
            const canvasHeight = (canvasWidth * 450) / 400;

            finalCanvas.width = canvasWidth;
            finalCanvas.height = canvasHeight;

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            const padding = canvasHeight * 0.05;
            const imgX = (canvasWidth - imgWidth) / 2;
            const imgY = padding;

            ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight);
            document.getElementById('final-preview').src = finalCanvas.toDataURL('image/png', 1.0);
        };

        return (
            <img id="final-preview" alt="Final Preview" className="final-preview" />
        );
    };

    return (
        <div className="frame-container">
            <h1>Upload Your Image</h1>
            {/* Hidden file input */}
            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="upload-input"
                id="file-upload"
            />
            {/* Custom button */}
            <label htmlFor="file-upload" className="custom-upload-button">
                Upload Image
            </label>
            {preview && (
                <div className="image-preview">
                    <div className="crop-container">
                        <Cropper
                            image={preview}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                        />
                    </div>
                </div>
            )}
            {croppedImage && (
                <div className="controls">
                    <label className="zoom-label">
                        Zoom:
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.1"
                            value={zoom}
                            onChange={(e) => setZoom(e.target.value)}
                            className="zoom-slider"
                        />
                    </label>

                    <h2>✅ Final Preview:</h2>
                    {renderFinalPreview()}

                    <button onClick={handleDownload} className="download-button">
                        🔽 Download Photo
                    </button>
                </div>
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export default Frame;