const mysql = require('mysql');
var db

function handleDisconnect()
{
    db = mysql.createConnection({
        host: "127.0.0.1",
        port: 3306,
        user: "chat",
        password: "admin",
        database: "chat"
    });
    
    
    db.connect((e) => {
        if (e)
        {
            console.log('ERROR CONNECT admin:', e.message);
            db.end()
            setTimeout(() => {
                handleDisconnect()
            }, 2000);
        } else {
            console.log("[MySQL] Connected to the database.");
            setInterval(() => {
                db.ping();
            }, 30*60*1000);
        }
    });

    db.on('error', function (err) {
        console.log('ERROR admin', err.code + '--' + err.address);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.log("[MySQL] Connection to database lost!")
            handleDisconnect();
        } else {
            console.log(err)
            throw err;
        }
    });
}

handleDisconnect();

module.exports = db;