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

        return Promise.resolve(requestInfo)
    }

    /**
     * 检测订单状况
     * @param {String} tradeNo 订单号
     * @return {Object}
     */
    async checkTradeStatus(tradeNo) {
        let result = await new Promise((resolve, reject) => {
            aop.execute('alipay.trade.query', this._config, {out_trade_no: tradeNo}).then(res => {
                resolve(res)
            })
        })

        return result
    }

    /**
     * 交易撤销
     * @param {String} tradeNo 订单号
     * @param {Object} payResult 交易结果 
     * @return {Object}
     */
    async cancelTrade(tradeNo, payResult) {
        let result = await new Promise((resolve, reject) => {
            aop.execute('alipay.trade.cancel', this._config, {out_trade_no: tradeNo}).then(res => {
                resolve(res)
            })
        })

        if(!result.data || result.data.code == '20000') {
            // 如果第一次同步撤销返回异常，则标记支付交易为未知状态
            payResult.trade_status = 'unknown'
            payResult.err_code_des = '支付宝撤销订单返回异常'
            return payResult
        } else {
            // 标记支付为失败，如果撤销未能成功，产生的单边帐由人工处理
            payResult.trade_status = 'failed'
            if(result.data.action == 'close') {
                payResult.err_code_des = '支付宝撤销订单，关闭交易，无退款'
            } else if(result.data.action == 'refund') {
                payResult.err_code_des = '支付宝撤销订单，产生退款'                
            }
            return payResult
        }
    }

    /**
     * 延迟函数
     * @param {Number} time 延迟时间
     */
    sleep(time) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, time)
        })
    }

    /**
     * 循环查询
     * @param {Object} out_trade_no 订单号
     * @param {Object} payResult 交易结果
     * @param {Number} queryCnt 循环次数
     * @param {Number} delayTime 延迟时间
     * @return {Object}
     */
    async loopQueryResult(out_trade_no, payResult, queryCnt = this._config.maxQueryRetry, delayTime = this._config.queryDuration) {
        let queryResult = {}
        for(let i = 0; i < queryCnt; i++) {
            queryResult = await this.checkTradeStatus(out_trade_no)
            await this.sleep(delayTime)

            if(queryResult.data != undefined && queryResult.data.code == '10000') {
                if("TRADE_FINISHED" == queryResult.data.trade_status || 
                    "TRADE_SUCCESS" == queryResult.data.trade_status || 
                    "TRADE_CLOSED" == queryResult.data.trade_status) {
                    break
                }
            }   
        }

        //检查&取消订单
        let result = await this.checkQueryAndCancel(queryResult.data, payResult, out_trade_no)

        return Promise.resolve(result)
    }

    /**
     * 判断交易是否支付成功，如果支付成功则更新result并返回，如果不成功则调用撤销
     * @param {Object} queryResult 查询结果
     * @param {Object} payResult 交易结果 
     * @param {String} tradeNo 订单号
     * @return {Object} 
     */
    async checkQueryAndCancel(queryResult, payResult, tradeNo) {
        if(this.querySuccess(queryResult)) {
            // 如果查询返回支付成功，标记交易成功
            payResult.trade_status = 'success'
            return payResult
        } else if(this.queryClose(queryResult)) {
            // 如果查询返回交易关闭，标记交易失败
            payResult.trade_status = 'failed'
            if(queryResult.result.err_code_des != undefined) {
                payResult.err_code_des = queryResult.result.err_code_des                 
            }
            return payResult
        }

        // 如果查询结果不是成功，则调用撤销交易
        return await this.cancelTrade(tradeNo, payResult)
    }

    /**
     * 查询返回"支付成功"
     * @return {Boolean}
     */
    querySuccess(res) {
        return res != undefined && 
                res.code == '10000' &&
                (res.trade_status == 'TRADE_SUCCESS' ||
                    res.trade_status == 'TRADE_FINISHED')
    }

    /**
     * 查询返回"交易关闭"
     * @return {Boolean}
     */
    queryClose(res) {
        return res != undefined && 
                res.code == '10000' &&
                res.trade_status == 'TRADE_CLOSED'
    }

    /**
     * 支付请求
     * @param {Object} _requestInfo
     * @return {Object}
     */
    async tradePayRequest(_requestInfo) {
        let result = await new Promise((resolve, reject) => {
            aop.execute('alipay.trade.pay', this._config, _requestInfo).then(res => {
                // 支付结果
                let payResult = res.result

                //请求成功时，设置返回数据
                if(res.data != undefined && payResult.return_code == 'success') {
                    //单位为分
                    payResult.total_fee = res.data.total_amount * 100
                    payResult.transaction_id = res.data.trade_no
                    payResult.openid = res.data.buyer_user_id
                    payResult.out_trade_no = res.data.out_trade_no
                    payResult.buyer_logon_id = res.data.buyer_logon_id
                }
                
                if(res.data != undefined && res.data.code == '10000') {
                    // 支付交易明确成功
                    payResult.trade_status = 'success'
                    resolve(payResult)
                } else if(res.data != undefined && res.data.code == "10003") {
                    // 返回用户处理中，则轮询查询交易是否成功，如果查询超时，则调用撤销
                    this.loopQueryResult(_requestInfo.out_trade_no, payResult).then(result => {
                        resolve(result)
                    })
                } else if(!res.data || res.data.code == "20000") {
                    // 系统错误或者网络异常未响应，则查询一次交易，如果交易没有支付成功，则调用撤销
                    this.loopQueryResult(_requestInfo.out_trade_no, payResult, 1, 0).then(result => {
                        resolve(result)
                    })
                } else {
                    // 其他情况表明该订单支付明确失败
                    payResult.trade_status = 'failed'
                    resolve(payResult)
                }
            })
        })

        return Promise.resolve(result)
    }
}