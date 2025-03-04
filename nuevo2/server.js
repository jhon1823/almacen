const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());
app.use(express.json());

// Ruta para buscar imágenes en CarCarePassion
app.get('/search-images', async (req, res) => {
    const searchTerm = req.query.term;
    if (!searchTerm) {
        return res.status(400).json({ error: 'Se requiere un término de búsqueda' });
    }

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Navegar a la página de búsqueda de CarCarePassion
        await page.goto(`https://www.carcarepassion.com/search?q=${encodeURIComponent(searchTerm)}`);

        // Esperar a que se carguen los resultados
        await page.waitForSelector('.product-item'); // Ajusta este selector según la estructura de la página

        // Extraer URLs de las imágenes
        const images = await page.evaluate(() => {
            const imgElements = document.querySelectorAll('.product-item img'); // Ajusta este selector
            const imgUrls = [];
            imgElements.forEach(img => {
                if (img.src) {
                    imgUrls.push(img.src);
                }
            });
            return imgUrls;
        });

        await browser.close();
        res.json({ images });
    } catch (error) {
        console.error('Error al buscar imágenes:', error);
        res.status(500).json({ error: 'Error al buscar imágenes' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});