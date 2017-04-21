import axios from 'axios'
import Promise from 'bluebird'
import signHelper from './signHelper'

/**
 * @格式化响应字符串
 * @param {String} resName
 * @return {String}
 */
const _formatString = resName => {
    return resName.split('.').join('_') + '_response'
} 

/**
 * 设置时间戳
 * @return {String}
 */
const _getAlipayVersionTimestamp = () => {
    let date = new Date()
    let month = (date.getMonth() + 1) < 10 ? "0" + (date.getMonth() + 1) : date.getMonth()
    let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate()
    let hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours()
    let mins  = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes()
    let sec   = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds()

    return `${date.getFullYear()}-${month}-${day} ${hours}:${mins}:${sec}`    
}

/**
 * 执行请求
 * @param {Object} method 请求方法
 * @param {Object} config 公共请求信息
 * @param {Object} bizContent 请求参数
 * @return {Object}
 */
const execute = async(method, config, bizContent) => {
    let sysParams = {
        app_id: "2017022805957246",
        version: '1.0',                        
        format: "JSON",
        sign_type: 'RSA',
        method: 'alipay.open.auth.token.app',                                                          
        timestamp: _getAlipayVersionTimestamp(),
        charset: 'utf-8',                      
    }

    let apiParamsContent = JSON.stringify(bizContent)
    let signContent = signHelper.getSignContent(sysParams, {biz_content: apiParamsContent}, false)
    let sign = signHelper.getSign(signContent, config.merchantPrivateKey)
    
    //请求链接
    let requestUrl = `https://openapi.alipay.com/gateway.do?${signHelper.getSignContent(sysParams, {biz_content: apiParamsContent}, true)}&sign=${encodeURIComponent(sign)}`

    //返回数据
    let resData = {}
    let result = await new Promise((resolve, reject) => {
        axios.post(requestUrl, {form: {biz_content: apiParamsContent}, json: false})
            .then(res => {
                //返回详细信息
                let detailData = res.data[_formatString(method)]
                console.log(res.data)
                resData.data = detailData
                resData.result = {}
                resData.result.return_code = 'success'
                if(detailData && detailData.sub_msg) {
                    resData.result.err_code_des = detailData.sub_msg
                }
                resolve(resData)
            })
            .catch(e => {
                resData.result = {}
                resData.result.return_code = 'failed'
                resData.result.return_msg = '服务其请求支付宝后台失败'
                resolve(resData)
            })
    })

    return Promise.resolve(result)
}

export default {
    execute
}
