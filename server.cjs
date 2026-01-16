const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Sirve los archivos estáticos de la carpeta 'dist' (donde Vite construye la app)
app.use(express.static(path.join(__dirname, 'dist')));

// Maneja cualquier otra ruta devolviendo index.html (para SPA)
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});
