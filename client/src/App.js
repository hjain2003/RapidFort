import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import Navbar from './Navbar';

const App = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [downloadLink, setDownloadLink] = useState('');
    const [metadata, setMetadata] = useState(null); 
    const [isLoading, setIsLoading] = useState(false); 

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setMessage('Please upload a file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:5000/convert', formData);
 
            setMetadata(response.data.metadata);
            setDownloadLink(response.data.downloadLink);
            setMessage('File converted successfully!');
        } catch (error) {
            setMessage('Error converting file.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="main_container">
                <form onSubmit={handleSubmit}>
                    <input type="file" accept=".docx" onChange={handleFileChange} />
                    <button type="submit">Convert</button>
                    {isLoading && (
                        <div className="loading">
                            <p>Converting... Please wait</p>
                            <div className="spinner"></div>
                        </div>
                    )}
                    {!isLoading && message && <p>{message}</p>}
                    <br />
                    {!isLoading && metadata && (
                        <div>
                            <h4><u>File Metadata:</u></h4>
                            <strong>Original Name:</strong> {metadata.originalName}<br />
                            <strong>Size:</strong> {metadata.size}<br />
                            <strong>Type:</strong> {metadata.type}<br />
                        </div>
                    )}
                    <br />
                    {!isLoading && downloadLink && (
                        <a href={downloadLink} download="converted.pdf">
                            Download PDF
                        </a>
                    )}
                </form>
            </div>
        </>
    );
};

export default App;
