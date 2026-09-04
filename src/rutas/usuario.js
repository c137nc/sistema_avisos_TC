const express = require ('express');
const router = express.Router();

//traigo a cors para poder hacer peticiones desde el front
const cors = require('cors');
router.use(cors());

//invocamos a las funciones definidas en el controller de Usuario
const controller = require('../controllers/usuarioController.js');
// ------ESTABLECEMOS LAS RUTAS DE NUESTRO SERVIDOR-----
// registro de usurio

router.post('/registrar' , controller.registrarUsuario);
//login de usuario
router.post('/login', controller.loginUsuario);

//exporto
module.exports = router;