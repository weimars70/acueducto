import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Configuración de PostgreSQL
const pgClient = new pg.Client({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: Number(process.env.POSTGRES_PORT) || 5432,
});

// Conectar a PostgreSQL y configurar notificaciones
async function initializePostgres() {
  try {
    await pgClient.connect();
    console.log('📡 Conectado a PostgreSQL');

    // Escuchar notificaciones
    await pgClient.query('LISTEN consumo_channel');
    console.log('📡 Escuchando canal consumo_channel');

    pgClient.on('notification', (msg) => {
      if (msg.channel === 'consumo_channel' && msg.payload) {
        console.log('🔔 Notificación recibida:', msg.payload);
        
        try {
          const payload = JSON.parse(msg.payload);
          const messageToSend = {
            type: 'consumo_update',
            operation: payload.operation,
            record: {
              ...payload.record,
              codigo: Number(payload.record.codigo),
              instalacion: Number(payload.record.instalacion),
              lectura: Number(payload.record.lectura),
              consumo: Number(payload.record.consumo),
              mes: Number(payload.record.mes),
              year: Number(payload.record.year),
              otros_cobros: Number(payload.record.otros_cobros),
              reconexion: Number(payload.record.reconexion),
              facturado: payload.record.facturada === 'SI'
            }
          };

          // Emitir a todos los clientes conectados
          io.emit('consumo_update', messageToSend);
        } catch (error) {
          console.error('❌ Error procesando notificación:', error);
        }
      }
    });

  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error);
    process.exit(1);
  }
}

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('✅ Cliente conectado - ID:', socket.id);
  
  socket.emit('connection', {
    type: 'connection',
    message: 'Conectado al servidor de WebSocket',
    timestamp: new Date().toISOString()
  });

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado - ID:', socket.id);
  });
});

// Inicializar servidor
const PORT = process.env.REALTIME_PORT || 3007;

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor de tiempo real iniciado en puerto ${PORT}`);
  initializePostgres();
});

// Manejo de cierre graceful
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

async function shutdown() {
  console.log('🛑 Cerrando servidor...');
  
  try {
    // Cerrar conexiones de Socket.IO
    await io.close();
    console.log('✅ Conexiones WebSocket cerradas');

    // Cerrar conexión PostgreSQL
    await pgClient.end();
    console.log('✅ Conexión PostgreSQL cerrada');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el cierre:', error);
    process.exit(1);
  }
}