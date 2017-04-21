import * as configInfo from '../config'
import Promise from 'bluebird'
import alipay from '../lib/alipay'

//条码支付
const tradePay = async(ctx, next) => {
    //获得请求数据
    let requestData = ctx.request.query
    console.log(requestData)

    // let _alipay = new alipay(configInfo)
    // _alipay.tradePayRequest()

    ctx.response.body = '授权成功'
} 

export default {
    tradePay,
}