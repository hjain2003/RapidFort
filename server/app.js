import express from 'express';
import multer from 'multer';
import docxConverter from 'docx-pdf';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import { fileURLToPath } from 'url';

// Derive __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Endpoint to handle upload and conversion
app.post('/convert', upload.single('file'), (req, res) => {
    const file = req.file;
    const outputFilePath = `converted/${file.filename}.pdf`;

    docxConverter(file.path, outputFilePath, (err) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Error converting file.' });
        } else {
            const downloadUrl = `http://localhost:${PORT}/download/${file.filename}`;
            res.json({
                message: 'File converted successfully!',
                metadata: {
                    originalName: file.originalname,
                    size: `${(file.size / 1024).toFixed(2)} KB`,
                    type: file.mimetype,
                },
                downloadLink: downloadUrl,
            });
        }
    });
});

// Endpoint to handle file download
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'converted', `${filename}.pdf`);

    res.download(filePath, 'converted.pdf', (err) => {
        if (err) {
            console.error(err);
        }
        fs.unlinkSync(filePath);
        fs.unlinkSync(path.join(__dirname, 'uploads', filename));
    });
});

if (!fs.existsSync('converted')) {
    fs.mkdirSync('converted');
}

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
