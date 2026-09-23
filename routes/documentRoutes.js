const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authMiddleware = require('../middlewares/authMiddleware');
const Usuario = require('../models/Usuario');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/documento', authMiddleware, upload.single('arquivo'), async (req, res) => {
  try {
    const perguntaDoUsuario = req.body.pergunta;
    if (!perguntaDoUsuario) {
      return res.status(400).json({ erro: 'A pergunta é obrigatória.' });
    }

    const usuarioId = req.usuario.id || req.usuario._id;
    let textoDocumento = '';

    if (req.file) {
      if (req.file.mimetype === 'application/pdf') {
        const pdfData = await pdfParse(req.file.buffer);
        textoDocumento = pdfData.text;
      } else {
        textoDocumento = req.file.buffer.toString('utf-8');
      }

      await Usuario.findByIdAndUpdate(usuarioId, { documentoContexto: textoDocumento });
    } else {
      const usuario = await Usuario.findById(usuarioId);
      if (!usuario || !usuario.documentoContexto) {
        return res.status(400).json({
          erro: 'Nenhum documento ativo nesta sessão. Por favor, anexe um PDF para iniciar.'
        });
      }
      textoDocumento = usuario.documentoContexto;
    }

    const promptRAG = `
Você é um analista de dados corporativo extremamente preciso.
Abaixo está um documento de referência. Responda à pergunta do usuário baseando-se APENAS no texto fornecido.
Se a resposta não estiver no texto, diga exatamente: "Desculpe, não encontrei essa informação no documento." NÃO INVENTE DADOS.

DOCUMENTO:
"""
${textoDocumento}
"""

PERGUNTA DO USUÁRIO: ${perguntaDoUsuario}
`;

    const result = await model.generateContent(promptRAG);
    const respostaIA = result.response.text();

    return res.status(200).json({
      resposta: respostaIA
    });
  } catch (error) {
    return res.status(500).json({
      erro: 'Erro interno ao processar documento.',
      detalhes: error.message
    });
  }
});

module.exports = router;