const express = require ('express');
const router = express.Router();

//traigo a cors para poder hacer peticiones desde el front
const cors = require('cors');
router.use(cors());

//invocamos a las funciones definidas en el controller de Usuario
const controller = require('../controllers/usuariosController.js');
//invocamos al middleware de autenticacion para proteger las rutas
const { verificarToken, verificarRol } = require('../middlewares/authMiddleware.js');
// ------ESTABLECEMOS LAS RUTAS DE NUESTRO SERVIDOR-----
// registro de usurio
//agrego uso de middleware para verificar token y rol de admin /
router.post('/registrar' , verificarToken, verificarRol('Administrador'), controller.registrarUsuario);
//login de usuario
router.post('/login', controller.loginUsuario);

//exporto
module.exports = router;