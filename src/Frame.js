// Frame.js
import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage';
import Example from './Example';
import Notes from './Notes';
import './App.css';

const Frame = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedImage, setCroppedImage] = useState(null);
    const [noteText, setNoteText] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const canvasRef = useRef(null);

    // Handle image upload
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

    // Handle crop complete
    const onCropComplete = useCallback(async (croppedArea, croppedAreaPixels) => {
        setIsProcessing(true);
        try {
            const croppedImg = await getCroppedImg(preview, croppedAreaPixels, 0.6);
            setCroppedImage(croppedImg);
        } catch (error) {
            console.error('Error cropping image:', error);
        } finally {
            setIsProcessing(false);
        }
    }, [preview]);

    // Handle download of the cropped image with note
    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (canvas && croppedImage) {
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = croppedImage;

            img.onload = () => {
                const imgWidth = img.naturalWidth * 0.6;
                const imgHeight = img.naturalHeight * 0.6;

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

                if (noteText) {
                    ctx.font = '40px "Brush Script MT", cursive';
                    ctx.fillStyle = 'black';
                    ctx.textAlign = 'center';
                    ctx.fillText(noteText, canvasWidth / 2, canvasHeight - padding);
                }

                const link = document.createElement('a');
                link.download = 'framed-image.png';
                link.href = canvas.toDataURL('image/png', 0.8);
                link.click();
            };
        }
    };

    // Render final preview
    const renderFinalPreview = () => {
        if (!croppedImage) return null;

        const finalCanvas = document.createElement('canvas');
        const ctx = finalCanvas.getContext('2d');
        const img = new Image();
        img.src = croppedImage;

        img.onload = () => {
            const imgWidth = img.naturalWidth * 0.6;
            const imgHeight = img.naturalHeight * 0.6;

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

            if (noteText) {
                ctx.font = '40px "Brush Script MT", cursive';
                ctx.fillStyle = 'black';
                ctx.textAlign = 'center';
                ctx.fillText(noteText, canvasWidth / 2, canvasHeight - padding);
            }

            document.getElementById('final-preview').src = finalCanvas.toDataURL('image/png', 0.8);
        };

        return <img id="final-preview" alt="Final Preview" className="final-preview" />;
    };

    // Handle reset of all state variables
    const handleReset = () => {
        setImage(null);
        setPreview(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedImage(null);
        setNoteText('');
    };

    return (
        <div className="frame-container">
            {/* Refresh Button */}
            <button onClick={handleReset} className="refresh-button">🔄 Refresh</button>

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
                            minZoom={1}
                            maxZoom={2}
                        />
                    </div>
                </div>
            )}
            {isProcessing && <p>Processing Image...</p>}
            {croppedImage && (
                <div className="controls">
                    <label className="zoom-label">
                        Zoom:
                        <input
                            type="range"
                            min="1"
                            max="2"
                            step="0.1"
                            value={zoom}
                            onChange={(e) => setZoom(e.target.value)}
                            className="zoom-slider"
                        />
                    </label>

                    <Notes noteText={noteText} setNoteText={setNoteText} />

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
