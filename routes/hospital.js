const express = require('express');
const Hospital = require('../models/hospital');
const app = express();
const mdAutenticacion = require('../middlewares/autenticacion');


//================================
// Obtener todos los hospitales
//================================

app.get('/', (req, res, next) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospital',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {

                res.status(200).json({
                    ok: true,
                    hospitales,
                    total: conteo
                });


            });



        });

});


//================================
// Crear hospital
//================================


app.post('/', mdAutenticacion.verificaToken, async(req, res, next) => {
    const body = req.body;

    const hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
        });

    });

});

//================================
// Actualizar hospital
//================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res, next) => {

    const id = req.params.id;
    const body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + 'no existe',
                errors: { message: 'No existe un hospital con este id' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(201).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });

});

//================================
// Borrar hospital
//================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res, next) => {

    const id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital que intenta borrar no existe',
                errors: { message: 'hospital a borrar no existe' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });

    });


});


module.exports = app;