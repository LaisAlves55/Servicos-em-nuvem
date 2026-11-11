const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        const usuarioExiste = await Usuario.findOne({ email });

        if (usuarioExiste) {
            return res.status(400).json({
                erro: 'E-mail já cadastrado!'
            });
        }

        const novoUsuario = new Usuario({
            nome,
            email,
            senha
        });

        await novoUsuario.save();

        res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso!'
        });

    } catch (erro) {
        console.error('Erro ao cadastrar:', erro);

        res.status(500).json({
            erro: 'Erro ao cadastrar usuário.'
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        const usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.status(401).json({
                erro: 'Credenciais inválidas!'
            });
        }

        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.senha
        );

        if (!senhaCorreta) {
            return res.status(401).json({
                erro: 'Credenciais inválidas!'
            });
        }

        const token = jwt.sign(
            {
                id: usuario._id,
                nome: usuario.nome,
                role: usuario.role || 'user'
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1d'
            }
        );

        res.status(200).json({
            token,
            nome: usuario.nome,
            role: usuario.role || 'user'
        });

    } catch (erro) {
        console.error('Erro ao fazer login:', erro);

        res.status(500).json({
            erro: 'Erro ao fazer login.'
        });
    }
};
