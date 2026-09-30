const jwt = require('jsonwebtoken');
const Mensagem = require('../models/Mensagem');

const autenticarSocket = (socket, next) => {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Token não fornecido.'));
        }

        const decodificado = jwt.verify(token, process.env.JWT_SECRET);

        socket.usuario = decodificado;

        next();

    } catch (erro) {
        return next(new Error('Token inválido ou expirado.'));
    }
};

const configurarSocket = (io) => {

    io.use(autenticarSocket);

    io.on('connection', (socket) => {

        console.log(`🟢 Usuário conectado: ${socket.usuario.nome}`);

        socket.on('novaMensagem', async (dados) => {
            try {
                const texto = dados?.texto;

                if (!texto || !texto.trim()) {
                    return;
                }

                const novaMensagem = await Mensagem.create({
                    autor: socket.usuario.nome,
                    texto: texto.trim()
                });

                io.emit('mensagemRecebida', novaMensagem);

            } catch (erro) {
                console.error('❌ Erro ao enviar mensagem pelo Socket.io:', erro);

                socket.emit('erroMensagem', {
                    erro: 'Não foi possível enviar a mensagem.'
                });
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔴 Usuário desconectado: ${socket.usuario.nome}`);
        });
    });
};

module.exports = configurarSocket;