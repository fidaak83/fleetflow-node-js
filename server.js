import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 8080;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON POST bodies
app.use(express.json());

app.get('/', (req, res) => {
    res.send('PDF Generator for FleetFlow');
});

app.get('/checkport', (req, res) => {
    res.send(`PDF Generator for FleetFlow ✅ Server running on port ${PORT}`);
});



// POST route for PDF generation
app.post('/pdf', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'Missing url in request body' });
    }

    let browser;
    try {
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        // await page.goto(url, { waitUntil: 'networkidle0' });
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 }); // 60 sec

        const buffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            scale: 0.9,
            margin: {
                top: '10mm',
                bottom: '10mm',
                left: '10mm',
                right: '10mm'
            }
        });

        const base64 = Buffer.from(buffer).toString('base64');

        res.json({ base64 });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'PDF generation failed', message: error.message });
    } finally {
        if (browser) await browser.close();
    }
});

// Catch-all 404 route
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested endpoint does not exist.',
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${PORT}`);
});

// UT2@w#uo2kldsHo4