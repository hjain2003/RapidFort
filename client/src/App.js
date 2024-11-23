import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import Navbar from './Navbar';

const App = () => {
    const [file, setFile] = useState(null);
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [downloadLink, setDownloadLink] = useState('');
    const [metadata, setMetadata] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            setFile(selectedFile);
            setMessage('');
            // Reset other states when new file is selected
            setDownloadLink('');
            setMetadata(null);
        } else {
            setFile(null);
            setMessage('Please select a valid .docx file');
        }
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        if (newPassword.trim() && newPassword.length < 4) {
            setMessage('Password must be at least 4 characters long');
        } else {
            setMessage('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Please upload a file.');
            return;
        }

        if (password.trim() && password.length < 4) {
            setMessage('Password must be at least 4 characters long');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        if (password.trim()) {
            formData.append('password', password.trim());
        }

        setIsLoading(true);
        setMessage('');
        setDownloadLink('');
        setMetadata(null);

        try {
            const response = await axios.post('http://127.0.0.1:5000/convert', formData);

            setMetadata(response.data.metadata);
            setDownloadLink(response.data.downloadLink);
            setMessage(
                `File converted successfully!${
                    response.data.metadata.isPasswordProtected 
                        ? ' Your PDF is password protected. Please use the provided password to open the file.'
                        : ''
                }`
            );
        } catch (error) {
            console.error('Conversion error:', error);
            if (error.response) {
                setMessage(`Error: ${error.response.data.error || 'Error converting file.'}`);
            } else if (error.request) {
                setMessage('Server not responding. Please try again later.');
            } else {
                setMessage('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="main_container">
                <form onSubmit={handleSubmit}>
                    <input 
                        type="file" 
                        accept=".docx" 
                        onChange={handleFileChange}
                        className="file-input" 
                    />
                    <br />
                    <input
                        type="password"
                        placeholder="Enter password (optional, min 4 characters)"
                        value={password}
                        onChange={handlePasswordChange}
                        className="password-input"
                        minLength="4"
                    />
                    <br />
                    <button 
                        type="submit" 
                        disabled={!file || isLoading || (password.trim() && password.length < 4)}
                        className={`submit-button ${(!file || isLoading || (password.trim() && password.length < 4)) ? 'disabled' : ''}`}
                    >
                        {isLoading ? 'Converting...' : 'Convert'}
                    </button>
                    
                    {isLoading && (
                        <div className="loading">
                            <p>Converting... Please wait</p>
                            <div className="spinner"></div>
                        </div>
                    )}
                    
                    {message && (
                        <p className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
                            {message}
                        </p>
                    )}
                    
                    {!isLoading && metadata && (
                        <div className="metadata">
                            <h4><u>File Metadata:</u></h4>
                            <p><strong>Original Name:</strong> {metadata.originalName}</p>
                            <p><strong>Size:</strong> {metadata.size}</p>
                            <p><strong>Type:</strong> {metadata.type}</p>
                            {metadata.isPasswordProtected && (
                                <p><strong>Security:</strong> Password Protected</p>
                            )}
                        </div>
                    )}
                    
                    {!isLoading && downloadLink && (
                        <div>
                            <a 
                                href={downloadLink} 
                                download="converted.pdf"
                                className="download-link"
                            >
                                Download PDF
                            </a>
                            {metadata?.isPasswordProtected && (
                                <p className="password-reminder">
                                    Remember: You'll need the password you set to open this PDF.
                                </p>
                            )}
                        </div>
                    )}
                </form>
            </div>
        </>
    );
};

export default App;