const mysql = require('mysql');
const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "quizmaker"
});

conn.connect((err)=>{
    if(err) throw err;
    console.log('Database connected');
    
});

module.exports = conn;