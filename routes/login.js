const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario');
const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;


app.post('', async(req, res, next) => {

    const body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuarioBD) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: { mensaje: 'Las credenciales enviadas no son correctas' }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {

            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: { mensaje: 'Las credenciales enviadas no son correctas' }
            });

        }

        // Crear token
        usuarioBD.password = ':)';
        const token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4h


        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token
        });

    });



});

module.exports = app;