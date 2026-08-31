//definimos variable para almacenar la libreria mysql
const mysql = require('mysql2');

//definimos constante para crear y almacenar la conexion a la base de datos
const connection = mysql.createConnection({
    //utilizamos las credenciales definidas (variables de entorno) para evitar exponerlas en el codigo.
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

//establecemos la conexion a la bd
connection.connect((error) => {
    if (error){
        console.log('Error de conexion: ' + error);
        return;
    }
    console.log('Conexion a la base de datos exitosa!');
})

module.exports = connection;

