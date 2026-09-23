const mongoose = require('mongoose');

const MensagemSchema = new mongoose.Schema({
    autor: {
        type: String,
        required: true
    },
    texto: {
        type: String,
        required: true
    },
    imagemUrl: {
        type: String,
        default: null
    },
    data: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Mensagem', MensagemSchema);
