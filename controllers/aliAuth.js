import * as config from '../config'
import aop from '../lib/aop'
import dbop from '../db/dboperator'
import Promise from 'bluebird'

// 授权请求
const authRoute = async(ctx, next) => {
    //获得请求数据
    let requestData = ctx.request.query

    if (requestData.app_id && requestData.source && requestData.app_auth_code) {
        // 使用app_auth_code换取app_auth_token
        let reqParam = {
            grant_type: 'authorization_code',
            code: requestData.app_auth_code,
        }
        await aop.execute('alipay.open.auth.token.app', config.ali.merchantPrivateKey, reqParam).then(data => {
            let res = data.alipay_open_auth_token_app_response
            if (res.code == '10000') {
                // 请求成功
                let queryCommand = `repalce into ${config.ali.tableName} (appauthtoken, Storecodeorigin, authappid, expiresin, reexpiresin, apprefreshtoken) values("${res.app_auth_token}", "${res.user_id}", "${res.auth_app_id}", "${res.expires_in}", "${res.re_expires_in}", "${res.app_refresh_token}")`
                // 存储数据
                dbop.storeData(queryCommand)

                // 更新商户签约状态
                let updateCommand = `update ${config.ali.storeTableName} set Sign=${1} where Storecodeorigin="${res.user_id}"`
                dbop.storeData(updateCommand)

                ctx.response.body = '授权成功，刷新商户授权页面，如果授权状态没有改变，请等待一段时间后再刷新。'
            } else {
                // 请求失败
                ctx.response.body = '授权失败, 请联系服务商进行处理。'                
            }
        }).catch(e => {
            ctx.response.body = '授权失败, 请联系服务商进行处理。'
        })
    } else {
        ctx.response.body = '授权失败, 请联系服务商进行处理。'
    }
} 

export default {
    authRoute,
}