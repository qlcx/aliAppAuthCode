import * as configInfo from '../config'
import Promise from 'bluebird'
import alipay from '../lib/alipay/alipay'

//条码支付
const tradePay = async(ctx, next) => {
    //获得请求数据
    let requestData = ctx.request.query

    let _alipay = new alipay(configInfo)

    let responseData = await new Promise((resolve, reject) => {
        //设置订单信息
        _alipay.setRequestInfo(requestData).then(res => {
            //交易请求
            _alipay.tradePayRequest(res).then(res => {
                resolve(res)
            })
        }).catch(e => {
            resolve({return_code: 'failed', return_msg: '服务器暂不可用，请检查错误'})
        })
    })

    ctx.response.body = responseData
} 

export default {
    tradePay,
}