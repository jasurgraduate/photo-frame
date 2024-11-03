// Example.js
import React from 'react';
import './App.css'; // Ensure your CSS includes styles for example images if needed

const Example = () => {
    return (
        <div className="example-container">
            <h2>Example Image 🔽:</h2>
            <img
                src="img/cat.png" // Replace with the path to your example image
                alt="Example"
                className="example-image"
            />
        </div>
    );
};

export default Example;
