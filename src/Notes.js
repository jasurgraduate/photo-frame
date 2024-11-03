// Notes.js
import React from 'react';
import './App.css';

const Notes = ({ noteText, setNoteText }) => {
    return (
        <div className="notes-container">
            <label htmlFor="note-input" className="notes-label">
                Add a Note:
            </label>
            <textarea
                id="note-input"
                className="note-textarea"
                placeholder="Enter your note here..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
            />
        </div>
    );
};

export default Notes;
