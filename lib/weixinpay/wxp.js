import Promise from 'bluebird'
import signHelper from './signHelper'
import xml2js from 'xml2js'

const request = Promise.promisify(require('request'))

/**
 * 执行请求
 * @param {Object} reqUrl 请求url
 * @param {Object} config 配置参数
 * @param {Object} params 请求参数
 * @return {Object}
 */
const execute = async(reqUrl, config, params) => {
    let requestParams = params
    // 设置随机字符串
    requestParams.nonce_str = Math.random().toString(36).substr(2, 15)


    //设置沙箱环境
    let signKey = config.key
    if(reqUrl.indexOf('/sandboxnew') >= 0) {
        let requestForm = {
            mch_id: requestParams.mch_id,
            nonce_str: requestParams.nonce_str,
        }

        requestForm.sign = signHelper.getSignContent(requestForm, 'njytdev1njytdev1njytdev1njytdev1', false)

        let sandboxBuilder = new xml2js.Builder()
        let sandboxForm = sandboxBuilder.buildObject(requestForm)

        signKey = await new Promise((resolve, reject) => {
            request({url: 'https://api.mch.weixin.qq.com/sandboxnew/pay/getsignkey', 
                method: 'POST', body: sandboxForm, json: false}).then(res => {
                    xml2js.parseString(res.body, (err, result) => {      
                        resolve(result.xml.sandbox_signkey[0])
                    })
                })
        })
    }

    //设置签名数据
    requestParams.sign = signHelper.getSignContent(requestParams, signKey, false)

    let builder = new xml2js.Builder()
    let form = builder.buildObject(requestParams)

    //设置证书(撤销操作需要双向证书)
    let agentOptions = {}
    if(reqUrl.indexOf('/pay/reverse') >= 0) {
        agentOptions.pfx = config.pfx
        agentOptions.passphrase = requestParams.mch_id
    }

    //返回数据
    let resData = {}
    let result = await new Promise((resolve, reject) => {
        request({
            url: reqUrl, 
            method: 'POST', 
            body: form,
            agentOptions: agentOptions, 
            json: false
        }).then(res => {
            let _data = res.body
            xml2js.parseString(_data, (err, result) => {
                resData = result.xml
                resData.result = {}
                resData.result.return_code = 'success'
                resolve(resData)
            })
        }).catch(e => {
            resData.result = {}
            resData.result.return_code = 'failed'
            resData.result.return_msg = '服务器请求微信后台失败'
            resolve(resData)
        })
    })

    return Promise.resolve(result)
}

export default {
    execute
}