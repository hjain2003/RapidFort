import React, { useState } from 'react';
import axios from 'axios';
import './App.css'
import Navbar from './Navbar';

const App = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [downloadLink, setDownloadLink] = useState('');

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

        try {
            const response = await axios.post('http://localhost:5000/convert', formData, {
                responseType: 'blob', // For downloading the file
            });

            // Create a download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            setDownloadLink(url);
            setMessage('File converted successfully!');
        } catch (error) {
            setMessage('Error converting file.');
        }
    };

    return (
      <>
        <Navbar/>
        <div className='main_container'>
            <form onSubmit={handleSubmit}>
                <input type="file" accept=".docx" onChange={handleFileChange} />
                <button type="submit">Convert</button>
            </form>
            {message && <p>{message}</p>}
            {downloadLink && (
                <a href={downloadLink} download="converted.pdf">
                    Download PDF
                </a>
            )}
        </div>
        </>
    );
};

export default App;
