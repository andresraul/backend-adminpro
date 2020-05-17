const express = require('express');
const app = express();

const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');


//================================
// Busqueda por colección
//================================
app.get('/coleccion/:tabla/:busqueda', async(req, res, next) => {

    const tabla = req.params.tabla;
    const busqueda = req.params.busqueda;
    const regex = new RegExp(busqueda, 'i');


    try {

        let busqueda;

        switch (tabla) {

            case 'hospitales':
                busqueda = await busquedaHospitales(regex);
                break;
            case 'medicos':
                busqueda = await busquedaMedicos(regex);
                break;
            case 'usuarios':
                busqueda = await busquedaUsuarios(regex);
                break;
            default:
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Los tipos de búsqueda sólo son: usuarios, medicos y hospitales',
                    error: { message: 'Tipo de tabla/colección no válido' }
                });

        }

        res.status(200).json({
            ok: true,
            [tabla]: busqueda
        });

    } catch (err) {
        return res.status(500).json({
            ok: false,
            mensaje: 'Error al realizar la búsqueda',
            error: err
        });

    }

});

//================================
// Busqueda general
//================================

app.get('/todo/:busqueda', async(req, res, next) => {

    const busqueda = req.params.busqueda;
    const regex = new RegExp(busqueda, 'i');

    try {

        const busquedas = await Promise.all([
            busquedaHospitales(regex),
            busquedaMedicos(regex),
            busquedaUsuarios(regex)
        ]);

        res.json({
            ok: true,
            hospitales: busquedas[0],
            medicos: busquedas[1],
            usuarios: busquedas[2]
        });

    } catch (err) {

        return res.status(500).json({
            ok: false,
            mensaje: 'Error al realizar la búsqueda',
            error: err
        });

    }

});

const busquedaHospitales = (regex) => {
    return Hospital.find({ nombre: regex })
        .populate('usuario', 'nombre email');
};

const busquedaMedicos = (regex) => {
    return Medico.find({ nombre: regex })
        .populate('usuario', 'nombre email')
        .populate('hospital');
};

const busquedaUsuarios = (regex) => {
    return Usuario.find()
        .or([{ nombre: regex }, { email: regex }]);
};


module.exports = app;