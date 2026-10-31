const express = require ('express');
const router = express.Router();

// ------ llamamos a las funciones definidas en el controller ------
const controller = require('../controllers/rutasAvisosController.js');
//llamamos al middleware de autenticacion para proteger las rutas
const {verificarToken , verificarRol} = require('../middlewares/authMiddleware.js');
//CRUD AVISOS
//crear aviso
router.post('/', verificarToken, verificarRol('Administrador','Editor'), controller.crearAviso);
//listar avisos vigentes en horario especifico
router.get('/vigentes', verificarToken, controller.mostrarAvisosVigentes);
//listar avisos vigentes segun filtros de fecha, carreras y edificios
router.get('/filtros', verificarToken, controller.mostrarAvisosVigentesFiltros);
//listar todos los avisos - admin
router.get('/', verificarToken, verificarRol('Administrador'), controller.mostrarTodosAvisos);
//listar un aviso por id - admin
router.get('/:id', verificarToken, verificarRol('Administrador'), controller.mostrarAvisoPorId);
//borar aviso por id
router.delete('/:id', verificarToken, verificarRol('Administrador', 'Supervisor'),controller.borrarAviso);
//modificar aviso por id
router.put('/:id', verificarToken, verificarRol('Administrador', 'Editor'), controller.modificarAviso);

//modificar estado aviso
router.patch('/:id/estado', verificarToken, verificarRol('Administrador', 'Supervisor'), controller.modificarEstadoAviso);
//lo pngo en un modulo para poder exportarlo y usarlo en otros archivos
module.exports = router;