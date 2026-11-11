const express = require('express');
const router = express.Router();

const Mensagem = require('../models/Mensagens');
const Usuario = require('../models/Usuario');

const autenticarToken = require('../middlewares/authMiddleware');
const apenasAdmin = require('../middlewares/apenasAdmin');

router.get('/tokens', autenticarToken, apenasAdmin, async (req, res) => {
    try {

        const resultado = await Mensagem.aggregate([
            {
                $group: {
                    _id: null,

                    totalTokens: {
                        $sum: '$tokensGastos'
                    },

                    totalMensagens: {
                        $sum: 1
                    }
                }
            }
        ]);

        const totalUsuarios = await Usuario.countDocuments();

        const dados = resultado[0] || {
            totalTokens: 0,
            totalMensagens: 0
        };

        return res.status(200).json({
            totalTokens: dados.totalTokens,
            totalMensagens: dados.totalMensagens,
            totalUsuarios: totalUsuarios
        });

    } catch (erro) {

        console.error('Erro no Analytics:', erro);

        return res.status(500).json({
            erro: 'Erro ao consultar dados do Dashboard.'
        });

    }
});

module.exports = router;
