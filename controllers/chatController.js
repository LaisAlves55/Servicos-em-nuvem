const cloudinary = require('cloudinary').v2;
const { GoogleGenAI } = require('@google/genai');
const Mensagem = require('../models/Mensagens');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const uploadParaCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'chat_ia'
            },
            (error, result) => {
                if (error) {
                    return reject(error);
                }

                resolve(result.secure_url);
            }
        );

        stream.end(buffer);
    });
};

exports.salvarMensagem = async (req, res) => {
    try {
        const { texto } = req.body;
        const nomeDoUsuarioLogado = req.usuario.nome;

        const novaMensagem = new Mensagem({
            autor: nomeDoUsuarioLogado,
            texto: texto,
            tokensGastos: 0
        });

        await novaMensagem.save();

        return res.status(201).json({
            mensagem: 'Mensagem enviada!',
            dados: novaMensagem
        });

    } catch (erro) {
        console.error('Erro ao salvar mensagem:', erro);

        return res.status(500).json({
            erro: 'Erro ao enviar mensagem.'
        });
    }
};

exports.listarMensagens = async (req, res) => {
    try {
        const mensagens = await Mensagem.find();

        return res.status(200).json(mensagens);

    } catch (erro) {
        console.error('Erro ao listar mensagens:', erro);

        return res.status(500).json({
            erro: 'Erro ao buscar mensagens.'
        });
    }
};

exports.enviarMensagemVision = async (req, res) => {
    try {
        const { prompt } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                error: 'Nenhuma imagem foi enviada.'
            });
        }

        const imagemUrl = await uploadParaCloudinary(file.buffer);

        const imagemBase64 = file.buffer.toString('base64');

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: prompt || 'Analise esta imagem'
                        },
                        {
                            inlineData: {
                                mimeType: file.mimetype,
                                data: imagemBase64
                            }
                        }
                    ]
                }
            ]
        });

        const respostaIA = response.text || 'Sem resposta gerada.';

        const tokens = response.usageMetadata?.totalTokenCount || 0;

        const novaMensagem = await Mensagem.create({
            autor: req.usuario.nome,
            texto: `Pergunta: ${prompt || 'Analise esta imagem'}\nResposta: ${respostaIA}`,
            imagemUrl: imagemUrl,
            tokensGastos: tokens
        });

        return res.status(200).json({
            resposta: respostaIA,
            imagemUrl: imagemUrl,
            tokensGastos: tokens,
            mensagem: novaMensagem
        });

    } catch (error) {
        console.error('Erro na rota vision:', error);

        return res.status(500).json({
            error: 'Erro ao processar imagem multimodal.'
        });
    }
};
