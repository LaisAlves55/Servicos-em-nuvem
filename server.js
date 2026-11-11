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

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Banco de dados conectado com sucesso!'))
    .catch((err) => console.log('❌ Erro ao conectar no banco:', err));

// Rota de saúde
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

// Importação das rotas
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const documentRoutes = require('./routes/documentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Registro das rotas
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/chat', documentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Criação do servidor HTTP
const servidor = http.createServer(app);

// Configuração Socket.IO
const io = new Server(servidor, {
    cors: {
        origin: '*'
    }
});

// Disponibiliza o Socket.IO para os controladores
app.set('io', io);

// Configura os eventos de comunicação
configurarSocket(io);

// Porta do servidor
const PORT = process.env.PORT || 3000;

servidor.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log('🔌 Socket.io funcionando!');
});
