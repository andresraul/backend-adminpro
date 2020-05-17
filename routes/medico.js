const express = require('express');

const Medico = require('../models/medico');
const app = express();
const mdAutenticacion = require('../middlewares/autenticacion');

//================================
// Obtener todos los médicos
//================================

app.get('/', (req, res, next) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando médicos',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    medicos,
                    total: conteo
                });

            });



        });

});


//================================
// Crear médico
//================================


app.post('/', mdAutenticacion.verificaToken, async(req, res, next) => {
    const body = req.body;

    const medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        hospital: body.hospital,
        usuario: req.usuario._id
    });

    medico.save((err, medicoGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear médico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
        });

    });

});


//================================
// Actualizar médico
//================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res, next) => {

    const id = req.params.id;
    const body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar médico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El médico con el id ' + id + 'no existe',
                errors: { message: 'No existe un médico con este id' }
            });
        }

        medico.nombre = body.nombre;
        medico.hospital = body.hospital;
        medico.usuario = req.usuario._id;

        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar médico',
                    errors: err
                });
            }

            res.status(201).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });

});


//================================
// Borrar médico
//================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res, next) => {

    const id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar médico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El médico que intenta borrar no existe',
                errors: { message: 'médico a borrar no existe' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });

    });


});

module.exports = app;