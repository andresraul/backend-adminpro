const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
const Usuario = require('../models/usuario');
const mdAutenticacion = require('../middlewares/autenticacion');


//================================
// Obtener todos los usuarios
//================================
app.get('/', (req, res, next) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec((err, usuarios) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando usuario',
                    errors: err
                });
            }

            Usuario.count({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    usuarios,
                    total: conteo
                });

            });



        });

});



//================================
// Actualizar usuario
//================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res, next) => {

    const id = req.params.id;
    const body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + 'no existe',
                errors: { message: 'No existe un usuario con este id' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(201).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });



});


//================================
// Crear usuario
//================================

app.post('/', mdAutenticacion.verificaToken, async(req, res, next) => {
    const body = req.body;

    let password = await bcrypt.hash(body.password, 10);

    const usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password,
        img: body.img,
        role: body.role
    });

    usuario.save((err, usuarioGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        });

    });

});

//================================
// Borrar usuario
//================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res, next) => {

    const id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario que intenta borrar no existe',
                errors: { message: 'usuanio a borrar no existe' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });

    });


});

module.exports = app;