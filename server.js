const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());

app.get('/', (req, res) => {
  res.send('🚀 Servidor de Yape Activo y Listo');
});

app.post('/api/yape', (req, res) => {
  try {
    const texto = req.body.mensaje || req.body.monto || '';
    console.log("Notificación recibida:", texto);

    const montoMatch = texto.match(/S\/\s*([\d\.,]+)/i);
    const monto = montoMatch ? parseFloat(montoMatch[1].replace(',', '.')) : 0.00;

    const nombreMatch = texto.match(/Yape!\s+(.*?)\s+te\s+envió/i);
    const remitente = nombreMatch ? nombreMatch[1].trim() : 'Cliente Yape';

    const datosYape = {
      remitente,
      monto: `S/ ${monto.toFixed(2)}`,
      codigo: 'AUTO_' + Date.now().toString().slice(-4),
      fecha: new Date().toLocaleTimeString('es-PE', { timeZone: 'America/Lima' })
    };

    console.log("Datos extraídos correctamente:", datosYape);

    io.emit('nuevo_yape', datosYape);

    return res.status(200).json({ success: true, data: datosYape });

  } catch (error) {
    console.error("Error al procesar el Yape:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

io.on('connection', (socket) => {
  console.log('💻 Cajero conectado:', socket.id);
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
});
