const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const configurarSocket = require('./controllers/socketController');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Banco de dados conectado com sucesso!'))
    .catch((err) => console.log('❌ Erro ao conectar no banco:', err));

app.get('/api/health', async (req, res) => {
    try {
        const estadoBanco = mongoose.connection.readyState === 1
            ? 'conectado'
            : 'desconectado';

        return res.status(200).json({
            status: 'ok',
            bancoDeDados: estadoBanco,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        return res.status(500).json({
            status: 'erro',
            bancoDeDados: 'erro_ao_verificar',
            timestamp: new Date().toISOString()
        });
    }
});

const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const documentRoutes = require('./routes/documentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/chat', documentRoutes);

const servidor = http.createServer(app);

const io = new Server(servidor, {
    cors: {
        origin: '*'
    }
});

configurarSocket(io);

const PORT = process.env.PORT || 3000;

servidor.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log('🔌 Socket.io funcionando!');
});