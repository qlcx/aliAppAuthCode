import * as config from '../config'
import aop from '../lib/aop'
import dbop from '../db/dboperator'
import Promise from 'bluebird'

// 授权请求
const authRoute = async(ctx, next) => {
    //获得请求数据
    let requestData = ctx.request.query

    if (requestData.app_id && requestData.source && requestData.app_auth_code) {
        // 如果请求参数中带有app_id、source、app_auth_code则认为授权成功
        ctx.response.body = '授权成功'
    } else {
        ctx.response.body = '授权失败'
    }

    // 使用app_auth_code换取app_auth_token
    let reqParam = {
        grant_type: 'authorization_code',
        code: requestData.app_auth_code,
    }
    aop.execute('alipay.open.auth.token.app', config.ali.merchantPrivateKey, reqParam).then(data => {
        let res = data.alipay_open_auth_token_app_response
        if (res.code == '10000') {
            // 请求成功
            let queryCommand = `insert into ${config.ali.tableName} (appauthtoken, userid, authappid, expiresin, reexpiresin, apprefreshtoken) values("${res.app_auth_token}", "${res.user_id}", "${res.auth_app_id}", "${res.expires_in}", "${res.re_expires_in}", "${res.app_refresh_token}")`

            console.log(queryCommand)
            // 存储数据
            dbop.storeData(queryCommand)
        } else {
            // 请求失败
        }
    }).catch(e => {
        console.log(e)
    })
} 

export default {
    authRoute,
}