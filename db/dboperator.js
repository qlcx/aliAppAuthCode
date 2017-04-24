import  db from './dbconnect'

// 数据存储
exports.storeData = function(query_command) {
    let client = db.conDB()
    client.query(
        query_command,
        err => {
            if (err) {
                console.log('storeInfo - ' + err)
            }
        }
    )
    client.end()
}