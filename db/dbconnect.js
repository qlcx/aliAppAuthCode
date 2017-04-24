import mysql from 'mysql'

const NAME_DATABASE = 'DB_NETPAY'

// 创建连接
exports.conDB = function() {
    var client = mysql.createConnection({ 
        host: '192.168.1.151',
        port: '3306', 
        user: 'njyt',  
        password: 'njyt',
        database: NAME_DATABASE,  
    })

    return client
}

// 关闭数据库
exports.closeDB = function(client) {
    client.destory()
}