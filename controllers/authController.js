const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        // Verifica se o email já existe
        const usuarioExiste = await Usuario.findOne({ email });
        if (usuarioExiste) {
            return res.status(400).json({ erro: 'E-mail já cadastrado!' });
        }

        // Cria e salva o usuário (a senha será criptografada automaticamente pelo model)
        const novoUsuario = new Usuario({ nome, email, senha });
        await novoUsuario.save();

        res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!' });
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao cadastrar usuário.' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Busca o usuário pelo e-mail
        const usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(401).json({ erro: 'Credenciais inválidas!' });
        }

        // Compara a senha digitada com a do banco
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
        if (!senhaCorreta) {
            return res.status(401).json({ erro: 'Credenciais inválidas!' });
        }

        // Gera o Token JWT contendo o ID e o Nome do usuário
        const token = jwt.sign(
            { id: usuario._id, nome: usuario.nome },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // O token expira em 1 dia
        );

        res.status(200).json({ token, nome: usuario.nome });
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao fazer login.' });
    }
};