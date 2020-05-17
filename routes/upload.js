const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const app = express();

const Usuario = require('../models/usuario');
const Medico = require('../models/medico');
const Hospital = require('../models/hospital');

const mdAutenticacion = require('../middlewares/autenticacion');

// default options
app.use(fileUpload());


app.put('/:tipo/:id', (req, res, next) => {

    const tipo = req.params.tipo;
    const id = req.params.id;

    // Tipos de c olección
    const tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Tipo de colección no es válido',
            error: { message: 'Los tipos de colección válidos son: ' + tiposValidos.join(', ') }
        });
    }



    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            message: 'No se envió ningún archivo',
            error: { message: 'Debe de seleccionar una imagen' }
        });
    }

    let archivo = req.files.imagen;
    let nombreCortado = archivo.name.split('.');
    let extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Sólo estas extensiones aceptamos
    const extensionesValidas = ['jpg', 'jpeg', 'png', 'gif'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Extención no válida',
            error: { message: 'Las extenciones válidas son: ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    const nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo a un path
    const path = `uploads/${ tipo }/${ nombreArchivo }`;


    archivo.mv(path, function(err) {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al mover archivo',
                error: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     message: 'Archivo movido'
        // });

    });


});


const subirPorTipo = async(tipo, id, nombreArchivo, res) => {


    try {

        if (tipo === 'usuarios') {
            const usuario = await Usuario.findById(id);

            if (!usuario) return noHayRegistro('usuario', res, tipo, nombreArchivo);

            eliminarImagen(tipo, usuario.img);

            usuario.img = nombreArchivo;
            const usuarioActualizado = await usuario.save();

            return res.status(200).json({
                ok: true,
                message: 'Imagen de usuario actualizada',
                usuario: usuarioActualizado
            });
        }

        if (tipo === 'medicos') {
            const medico = await Medico.findById(id);

            if (!medico) return noHayRegistro('medico', res, tipo, nombreArchivo);

            eliminarImagen(tipo, medico.img);

            medico.img = nombreArchivo;
            const medicoActualizado = await medico.save();

            return res.status(200).json({
                ok: true,
                message: 'Imagen de medico actualizada',
                medico: medicoActualizado
            });

        }

        if (tipo === 'hospitales') {
            const hospital = await Hospital.findById(id);

            if (!hospital) return noHayRegistro('hospital', res, tipo, nombreArchivo);

            eliminarImagen(tipo, hospital.img);

            hospital.img = nombreArchivo;
            const hospitalActualizado = await hospital.save();

            return res.status(200).json({
                ok: true,
                message: 'Imagen de hospital actualizada',
                hospital: hospitalActualizado
            });

        }
    } catch (err) {
        return res.status(500).json({
            ok: false,
            message: 'Error al actualizar imagen',
            error: err
        });

    }

};
const eliminarImagen = (tipo, imagen) => {

    const pathViejo = `./uploads/${tipo}/${imagen}`;

    if (fs.existsSync(pathViejo)) {
        fs.unlinkSync(pathViejo);
    }
};

const noHayRegistro = (coleccion, res, tipo, imagen) => {
    eliminarImagen(tipo, imagen);
    res.status(500).json({
        ok: false,
        message: `El ${coleccion} no existe`,
        error: { message: `El ${coleccion} no existe`, }
    });
};


module.exports = app;