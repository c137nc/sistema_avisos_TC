//traigo a dotenv para poder usar variables de entorno
const dotenv = require('dotenv');
//indicmos a donde esta el archivo .env
dotenv.config({ path: './env/.env' });

//traigo a express
const express = require('express');
const app = express();

//traemos a cors para poder hacer peticiones desde el front
const cors = require('cors');
//Agrego esto para habilitar CORS para el front
app.use(cors({
  origin: ['https://avisosunpaz.com.ar', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
  //Se agregó permiso para q el token modificado pueda pasar al back
}));

//invocamos al modulo de conexion a la base de datos
const connection = require('./database/sistema_avisos_db.js');

//usamos libreria para capturar datos de formularios
app.use(express.urlencoded({ extended: false }));
//HACEMOS QUE ENTIENDA JSON
app.use(express.json());

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

