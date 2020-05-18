const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario');
const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;

// Google
const CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

//================================
// Autenticación de google
//================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

app.post('/google', async(req, res, next) => {

    const token = req.body.token;

    const googleUser = await verify(token).catch(e => {

        return res.status(400).json({
            ok: false,
            error: e,
            message: 'Token no válido'

        });

    });

    Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }


        if (usuarioBD) {
            if (usuarioBD.google === false) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticación normal'
                });
            } else {
                const token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4h

                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token,
                    id: usuarioBD._id
                });
            }
        } else {
            // El usuario no existe ...hay que crearlo
            const usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioBD) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al crear usuario',
                        errors: err
                    });
                }

                const token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4h

                res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token,
                    id: usuarioBD._id
                });

            });
        }

    });


});


//================================
// Autenticación normal
//================================


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
        const token = jwt.sign({ usuario: usuarioBD }, SEED, { expiresIn: 14400 }); // 4h


        res.status(200).json({
            ok: true,
            usuario: usuarioBD,
            token,
            id: usuarioBD._id
        });

    });



});

module.exports = app;