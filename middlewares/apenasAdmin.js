const apenasAdmin = (req, res, next) => {

    if (req.usuario && req.usuario.role === "admin") {

        next();

    } else {

        return res.status(403).json({
            erro: "Acesso permitido somente para administradores."
        });

    }

};

module.exports = apenasAdmin;
