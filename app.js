// Requires
const express = require('express');
const mongoose = require('mongoose');


// Inicializar variables
const app = express();

// Conección a la base de datos
const urlDB = 'mongodb://localhost:27017/hospitalDB';
mongoose.connect(urlDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err, res) => {
    if (err) throw err;
    console.log(`DB ONLINE. URL DB: ${ urlDB }`);
});

app.get('/', (req, res, next) => {


    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizada correctamente'
    });


});


// Escuchar peticiones
app.listen(3000, () => {

    console.log('Express server puerto 3000 online');

})