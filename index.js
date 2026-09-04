//traigo a dotenv para poder usar variables de entorno
const dotenv = require('dotenv');
//indicmos a donde esta el archivo .env
dotenv.config({ path: './env/.env' });

//traigo a express
const express = require('express');
const app = express();

//invocamos al modulo de conexion a la base de datos
const connection = require('./database/sistema_avisos_db.js');

//usamos libreria para capturar datos de formularios
app.use(express.urlencoded({ extended: false }));
//HACEMOS QUE ENTIENDA JSON
app.use(express.json());


//invocamos la libreria express-session para manejar sesiones
const session = require('express-session');
//configuramos la sesion
app.use(session({
    secret: 'secret', //clave que usa express-session para firmar la cookie de sesion
    resave: true, // guarda la sesion en cada peticion, aunque no haya cambios
    saveUninitialized: true // guarda la sesion aunque no haya sido inicializada    
}));


//RUTAS

//referencia al modulo usuario.js donde estan definidas las rutas de /login y /registrar
const mainRouter = require('./src/rutas/usuario.js');
app.use(mainRouter);
//indico referencia a modulo rutasAvisos.js donde estan definidas las rutas de avisos
const rutasAvisos = require('./src/rutas/rutasAvisos.js');
app.use('/avisos' , rutasAvisos);


//configuramos puerto
const PORT = process.env.PORT || 3001;


//enciendo el servidor - va al final del archivo
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    }
);

