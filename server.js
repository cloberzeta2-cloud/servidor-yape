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
  const { monto, remitente, codigo } = req.body;
  
  if (!monto || !remitente) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const pagoData = {
    monto: monto,
    remitente: remitente,
    codigo: codigo || 'N/A',
    fecha: new Date().toLocaleTimeString()
  };

  io.emit('alerta_pago', pagoData);
  console.log('📢 Yape reenviado a cajeros:', pagoData);

  return res.json({ status: "success", message: "Notificación enviada a cajeros" });
});

io.on('connection', (socket) => {
  console.log('💻 Cajero conectado:', socket.id);
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
});
