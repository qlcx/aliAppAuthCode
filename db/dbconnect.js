import mysql from 'mysql'

const NAME_DATABASE = 'DB_NETPAY'

// 创建连接
exports.conDB = function() {
    var client = mysql.createConnection({ 
        host: '127.0.0.1',
        port: '8901', 
        user: 'njyt',  
        password: 'nc229njytDev1',
        database: NAME_DATABASE,  
    })

    return client
}

// 关闭数据库
exports.closeDB = function(client) {
    client.destory()
}