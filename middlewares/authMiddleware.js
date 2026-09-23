const jwt = require('jsonwebtoken');

const autenticarToken = (req, res, next) => {
    // Busca o cabeçalho Authorization
    const authHeader = req.headers['authorization'];
    
    // O formato é "Bearer TOKEN", então dividimos a string para pegar só o token
    const token = authHeader && authHeader.split(' ')[1];

    // Se não tiver token, barra na porta
    if (!token) {
        return res.status(401).json({ erro: 'Acesso negado. Token não fornecido.' });
    }

    try {
        // Verifica se o crachá é verdadeiro usando nossa palavra secreta
        const decodificado = jwt.verify(token, process.env.JWT_SECRET);
        
        // Pendura as informações do usuário na requisição para as próximas rotas usarem
        req.usuario = decodificado;
        next(); // Libera a entrada!
    } catch (erro) {
        res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
};

module.exports = autenticarToken;