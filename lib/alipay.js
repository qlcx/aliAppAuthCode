import aop from './aop'
import Promise from 'bluebird'

/**
 * 设置商户订单号
 * @return {String}
 */
const setOutTradeNo = () => {
    let date = new Date()
    let year = date.getFullYear()
    let month = (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : date.getMonth()
    let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate()
    let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours()
    let mins  = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()
    let sec   = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()
    let milliSec = date.getMilliseconds()

    return (`${year}${month}${day}${hours}${mins}${sec}${milliSec}`)
}

export default class alipay {
    constructor(config) {
        this._config = {}
        this._config.appid = config.alipay_config.appid
        this._config.notifyUrl = config.alipay_config.notifyUrl
        this._config.gatewayUrl = config.alipay_config.gatewayUrl || 'https://openapi.alipaydev.com/gateway.do'
        this._config.merchantPrivateKey = config.alipay_config.merchantPrivateKey
        this._config.pid = config.alipay_config.pid 

        this._config.maxQueryRetry = config.alipay_config.maxQueryRetry
        this._config.queryDuration = config.alipay_config.queryDuration
    }

    /**
     * 设置请求参数
     * @param {Object} 订单信息
     * @return {Object}
     */
    setRequestInfo(options) {
        let requestInfo = {}
        requestInfo.out_trade_no =  setOutTradeNo()               //商户订单号
        requestInfo.scene = 'bar_code'                            //条码支付
        requestInfo.auth_code = options.auth_code                 //支付授权码
        requestInfo.subject = options.subject                     //订单标题
        requestInfo.total_amount = options.total_fee / 100        //订单总金额，精确到小数点后两位
        requestInfo.body = options.body                           //订单描述
        requestInfo.extend_params = {
            sys_service_provider_id: this._config.pid             //系统商编号
        }

        return Promise.resolve(requestInfo)
    }

    /**
     * 支付请求
     * @param {Object} _requestInfo
     * @return {Object}
     */
    async tradePayRequest() {
        aop.execute('alipay.trade.pay', this._config, {grant_type: 'authorization_code', code: 'd6cd01a7c12e4f989e5ed648e29a7C07'})
    }
}