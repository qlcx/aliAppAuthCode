import * as config from '../config'
import aop from '../lib/aop'
import Promise from 'bluebird'

//条码支付
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
    aop.execute('alipay.open.auth.token.app', config.merchantPrivateKey, reqParam).then(res => {

    }).catch(e => {
        
    })
} 

export default {
    authRoute,
}