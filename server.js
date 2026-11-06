const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta raíz para verificar que el servidor está vivo
app.get('/', (req, res) => {
  res.status(200).send('Servidor Yape activo y funcionando correctamente.');
});

// Endpoint que recibe la notificación de MacroDroid
app.post('/api/yape', (req, res) => {
  try {
    const texto = req.body.mensaje || req.body.monto || JSON.stringify(req.body) || '';
    console.log("Notificación recibida de MacroDroid:", texto);

    // Extracción segura del monto usando Expresión Regular
    const montoMatch = texto.match(/S\/\s*([\d\.,]+)/i);
    const monto = montoMatch ? parseFloat(montoMatch[1].replace(',', '.')) : 0.00;

    // Extracción segura del nombre del remitente
    const nombreMatch = texto.match(/Yape!\s+(.*?)\s+te\s+envió/i);
    const remitente = nombreMatch ? nombreMatch[1].trim() : 'Cliente Yape';

    const datosYape = {
      remitente,
      monto: `S/ ${monto.toFixed(2)}`,
      codigo: 'YAPE_' + Date.now().toString().slice(-4),
      fecha: new Date().toLocaleTimeString('es-PE', { timeZone: 'America/Lima' })
    };

    console.log("Datos procesados y listos para enviar a la web:", datosYape);

    // Enviar por WebSocket a la página web abierta
    io.emit('nuevo_yape', datosYape);

    return res.status(200).json({ success: true, data: datosYape });

  } catch (error) {
    console.error("Error al procesar la notificación:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
