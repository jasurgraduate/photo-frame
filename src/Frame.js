// Frame.js
import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage';
import Example from './Example';
import Notes from './Notes'; // Import Notes component
import './App.css';

const Frame = () => {
    const [image, setImage] = useState(null); // State to hold the uploaded image file
    const [preview, setPreview] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedImage, setCroppedImage] = useState(null);
    const [noteText, setNoteText] = useState('');
    const canvasRef = useRef(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(file); // Set the file object to the image state
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = useCallback(async (croppedArea, croppedAreaPixels) => {
        try {
            const croppedImg = await getCroppedImg(preview, croppedAreaPixels);
            setCroppedImage(croppedImg);
        } catch (error) {
            console.error('Error cropping image:', error);
        }
    }, [preview]);

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

                // Add note text if provided
                if (noteText) {
                    ctx.font = '40px "Brush Script MT", cursive';
                    ctx.fillStyle = 'black';
                    ctx.textAlign = 'center';
                    ctx.fillText(noteText, canvasWidth / 2, canvasHeight - padding);
                }

                const link = document.createElement('a');
                link.download = 'camera-print.png';
                link.href = canvas.toDataURL('image/png', 1.0);
                link.click();
            };
        }
    };

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

            // Draw note text if provided
            if (noteText) {
                ctx.font = '40px "Brush Script MT", cursive';
                ctx.fillStyle = 'black';
                ctx.textAlign = 'center';
                ctx.fillText(noteText, canvasWidth / 2, canvasHeight - padding);
            }

            document.getElementById('final-preview').src = finalCanvas.toDataURL('image/png', 1.0);
        };

        return <img id="final-preview" alt="Final Preview" className="final-preview" />;
    };

    return (
        <div className="frame-container">
            {!preview && <Example />}
            <h1>Upload Your Image ⬇️:</h1>

            <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="upload-input"
                id="file-upload"
            />
            <label htmlFor="file-upload" className="custom-upload-button">
                🔼 Upload Image 🖼️
            </label>

            {/* Display image file name if it exists */}
            {image && <p className="file-info">Selected File: {image.name}</p>}

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

                    <Notes noteText={noteText} setNoteText={setNoteText} /> {/* Add Notes Component */}

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
