const express = require('express');

const fs = require('fs');
const path = require('path');
const app = express();

const Usuario = require('../models/usuario');
const Medico = require('../models/medico');
const Hospital = require('../models/hospital');

const mdAutenticacion = require('../middlewares/autenticacion');


app.get('/:tipo/:img', (req, res, next) => {

    const tipo = req.params.tipo;
    const img = req.params.img;

    const pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        const pathNoImage = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImage);
    }

});

module.exports = app;