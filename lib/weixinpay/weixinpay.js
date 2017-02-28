import Promise from 'bluebird'
import wxp from './wxp'

export default class weixinpay {
    constructor(config) {
        this._config = {}
        this._config.appid = config.appid
        this._config.key = config.key
        this._config.appSecret = config.appSecret
        this._config.mchid = config.mchid
        this._config.maxQueryRetry = config.maxQueryRetry
        this._config.queryDuration = config.queryDuration
        this._config.microPayUrl = config.microPayUrl
        this._config.orderQueryUrl = config.orderQueryUrl
        this._config.reverseUrl = config.reverseUrl
        this._config.pfx = config.pfx
    }

    /**
     * 设置商户订单号
     * @return {String}
     */
    setOutTradeNo = () => {
        // let date = new Date()
        // let year = date.getFullYear()
        // let month = (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : date.getMonth()
        // let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate()
        // let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours()
        // let mins  = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()
        // let sec   = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()
        // let milliSec = date.getMilliseconds()
        return `${new Date().getTime()}${Math.random().toString(10).substr(2, 8)}`
    }

    /**
     * 设置请求参数
     * @param {Object} 订单信息
     * @return {Object}
     */
    setRequestInfo(options) {
        let requestInfo = {}
        //用户授权码
        requestInfo.auth_code = options.auth_code
        //商品描述
        requestInfo.body = options.body
        //商户订单号
        requestInfo.out_trade_no = this.setOutTradeNo()
        //总金额
        requestInfo.total_fee = options.total_fee

        return Promise.resolve(requestInfo)
    }
    
    /**
     * 查询交易状态
     * @param {String} orderNo 订单号
     * @return {Object}
     */
    async queryOrder(orderNo) {
        return await new Promise((resolve, reject) => {
            let requestInfo = {
                appid: this._config.appid,
                mch_id: this._config.mchid,
                out_trade_no: orderNo,
            }
            wxp.execute(this._config.orderQueryUrl, this._config, requestInfo).then(res => {
                resolve(res)
            })
        })
    } 

    /**
     * 取消交易
     * @param {String} orderNo 订单号
     * @return {Object}
     */
    async cancelOrder(orderNo) {
        return await new Promise((resolve, reject) => {
            let requestInfo = {
                appid: this._config.appid,
                mch_id: this._config.mchid,
                out_trade_no: orderNo,
            }
            wxp.execute(this._config.reverseUrl, this._config, requestInfo).then(res => {
                resolve(res)
            })
        })
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
     * 确认支付是否成功
     * @param {String} orderNo 订单号
     * @param {Object} payResult 交易结果
     * @return {Object}
     */
    async loopQueryResult(orderNo, payResult) {
        let queryResult = {}
        for(let i = 0; i < this._config.maxQueryRetry; i++) {
            queryResult = await this.queryOrder(orderNo)

            i && await this.sleep(this._config.queryDuration)

            //设置错误描述
            payResult.err_code_des = queryResult.err_code_des && queryResult.err_code_des[0]

            //请求失败
            if(!queryResult.return_code || !queryResult.result_code ) {
                payResult.return_msg = '微信支付查询订单接口调用失败'
                break
            }

            if(queryResult.return_code[0] == 'SUCCESS' &&
                queryResult.result_code[0] == 'SUCCESS') {
                
                payResult.total_fee = queryResult.total_fee[0]
                payResult.out_trade_no = queryResult.out_trade_no[0]
                payResult.transaction_id = queryResult.transaction_id[0]
                payResult.openid = queryResult.openid[0]

                //支付成功
                if(queryResult.trade_state[0] == 'SUCCESS') {
                    payResult.return_code = 'success'
                    payResult.trade_status = 'success'
                    break
                } else if(queryResult.trade_state[0] == 'USERPAYING') {
                    //用户支付中
                    continue
                }
            }

            //如果返回错误码为“此交易订单号不存在”则直接认定失败
            if(queryResult.err_code && queryResult.err_code[0] == 'ORDERNOTEXIST') {
                payResult.trade_status = 'failed'
                payResult.err_code_des = '微信支付此订单号不存在'
                break
            }
        }



        //查询交易状态超时，则撤销订单
        //如果失败会重复调用十次
        let cancelResult = {}
        if(!payResult.trade_status) {
            for(let j = 0; j < 10; j++) {
                cancelResult = await this.cancelOrder(orderNo)

                //撤销订单接口调用失败
                if(!cancelResult.return_code || cancelResult.return_code[0] != 'SUCCESS') {
                    payResult.trade_status = 'unknow'
                    payResult.err_code_des = '微信支付撤销订单接口调用失败'
                    break
                }

                if(cancelResult.result_code && cancelResult.result_code[0] == 'SUCCESS' && cancelResult.recall[0] == 'N') {
                    payResult.trade_status = 'failed'
                    payResult.err_code_des = '微信支付撤销订单成功'
                    break
                } 
            }
        }

        //撤销订单操作超时
        if(!payResult.trade_status) {
            payResult.trade_status = 'unknow'
            payResult.err_code_des = cancelResult.err_code_des && cancelResult.err_code_des[0]
        }

        return Promise.resolve(payResult)
    }

    /**
     * 支付请求
     * @param {Object} _requestInfo
     * @return {Object}
     */
    async microPayRequest(_requestInfo) {
        let result = await new Promise((resolve, reject) => {
            //设置请求参数
            let requestInfo = {
                appid: this._config.appid,
                mch_id: this._config.mchid,
                auth_code: _requestInfo.auth_code,
                body: _requestInfo.body,
                out_trade_no: _requestInfo.out_trade_no,
                total_fee: _requestInfo.total_fee
            }

            wxp.execute(this._config.microPayUrl, this._config, requestInfo).then(res => {
                // 支付结果
                let payResult = res.result

                //接口调用失败处理
                if(!res.return_code || !res.out_trade_no || !res.result_code) {
                    // payResult.return_code = 'failed'
                    payResult.return_msg = '微信支付接口调用失败,请确认是否输入是否有误!'
                    // resolve(payResult)
                }
                
                if(res.return_code &&
                    res.return_code[0] == 'SUCCESS' && 
                    res.result_code[0] == 'FAIL' &&
                    res.err_code[0] != 'USERPAYING' &&
                    res.err_code[0] != 'SYSTEMERROR') {
                    //接口调用成功，返回调用失败
                    payResult.return_code = 'failed'
                    payResult.return_msg = '微信支付接口调用成功，明确返回调用失败'
                    resolve(payResult)
                } else {
                    //确认支付是否成功
                    this.loopQueryResult( _requestInfo.out_trade_no, payResult).then(res => {
                        resolve(res)
                    })
                }
            })
        })

        return Promise.resolve(result)
    }
}