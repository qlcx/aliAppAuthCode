import * as configInfo from '../config'
import weixinpay from '../lib/weixinpay/weixinpay'
import Promise from 'bluebird'
import LoadBalance from '../lib/loadBalance'

//刷卡支付
const microPay = async(ctx, next) => {
    //获得请求数据
    let requestData = ctx.request.query

    let _weixinpay = new weixinpay(configInfo.weixin_config)
    LoadBalance.wx()
    
    //设置订单信息
    // let responseData = await new Promise((resolve, reject) => {
    //     _weixinpay.setRequestInfo(requestData).then(res => {
    //         //支付请求
    //         _weixinpay.microPayRequest(res).then(res => {
    //             resolve(res)
    //         })
    //     }).catch(e => {
    //         resolve({return_code: 'failed', return_msg: '服务器暂不可用，请检查错误'})
    //     })
    // })
    
    // ctx.response.body = responseData
}

export default {
    microPay,
}