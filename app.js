// Requires
const express = require('express');
const mongoose = require('mongoose');
var bodyParser = require('body-parser');


// Inicializar variables
const app = express();

// body parse 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Importar rutas

const appRoutes = require('./routes/app');
const usuarioRoutes = require('./routes/usuario');
const loginRoutes = require('./routes/login');

// Conección a la base de datos
const urlDB = 'mongodb://localhost:27017/hospitalDB';
mongoose.connect(urlDB, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err, res) => {
    if (err) throw err;
    console.log(`DB ONLINE. URL DB: ${ urlDB }`);
});

// Rutas

app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);


// Escuchar peticiones
app.listen(3000, () => {

    console.log('Express server puerto 3000 online');

})