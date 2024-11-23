import express from 'express';
import multer from 'multer';
import docxConverter from 'docx-pdf';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { PDFDocument } from 'pdf-lib';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/convert', upload.single('file'), async (req, res) => {
    const file = req.file;
    const password = req.body.password;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    if (file.mimetype !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return res.status(400).json({ error: 'Invalid file type. Only .docx files are allowed.' });
    }

    const tempOutputPath = `converted/${file.filename}_temp.pdf`;
    const finalOutputPath = `converted/${file.filename}.pdf`;

    try {
        // Convert DOCX to PDF using Promise wrapper
        await new Promise((resolve, reject) => {
            docxConverter(file.path, tempOutputPath, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Read the temporary PDF
        const pdfBytes = await fs.promises.readFile(tempOutputPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);

        if (password && password.trim()) {
            // Encrypt the PDF with the password
            const encryptedPdfBytes = await pdfDoc.save({
                userPassword: password,
                ownerPassword: password + '_owner', // Different owner password for better security
                permissions: {
                    printing: true,
                    modifying: false,
                    copying: false,
                    annotating: false,
                    fillingForms: false,
                    contentAccessibility: true,
                    documentAssembly: false,
                    printingHighQuality: false,
                },
                pdfVersion: '1.7', // Use latest PDF version for better security
            });

            // Write the encrypted PDF
            await fs.promises.writeFile(finalOutputPath, encryptedPdfBytes);
            
            // Clean up temporary file
            await fs.promises.unlink(tempOutputPath);
        } else {
            // If no password, just rename the temp file
            await fs.promises.rename(tempOutputPath, finalOutputPath);
        }

        const downloadUrl = `http://127.0.0.1:5000/download/${file.filename}`;
        res.json({
            message: 'File converted successfully!',
            metadata: {
                originalName: file.originalname,
                size: `${(file.size / 1024).toFixed(2)} KB`,
                type: file.mimetype,
                isPasswordProtected: !!password
            },
            downloadLink: downloadUrl,
        });

    } catch (error) {
        console.error('Error processing file:', error);
        // Clean up any temporary files
        if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
        if (fs.existsSync(finalOutputPath)) fs.unlinkSync(finalOutputPath);
        
        return res.status(500).json({ 
            error: 'Error processing file. Please try again.' 
        });
    }
});

// Endpoint to handle file download
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'converted', `${filename}.pdf`);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found.' });
    }

    res.download(filePath, 'converted.pdf', (err) => {
        if (err) {
            console.error('Download error:', err);
            if (!res.headersSent) {
                res.status(500).json({ error: 'Error downloading file.' });
            }
        }
        // Clean up files after successful download
        try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            const uploadPath = path.join(__dirname, 'uploads', filename);
            if (fs.existsSync(uploadPath)) fs.unlinkSync(uploadPath);
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    });
});

if (!fs.existsSync('converted')) {
    fs.mkdirSync('converted');
}

app.get('/', (req, res) => {
    res.send('PDF Converter Server Running');
});

app.listen(PORT, () => {
    console.log(`Server running on http://127.0.0.1:5000/`);
});