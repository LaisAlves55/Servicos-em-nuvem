
const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  documentoContexto: { type: String, default: null },

  role: {
    type: String,
    default: "user"
  }
});

module.exports = mongoose.model('Usuario', usuarioSchema);
