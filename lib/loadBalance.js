import * as configInfo from '../config'
import wx_signHelper from './weixinpay/signHelper'
import xml2js from 'xml2js'
import Promise from 'bluebird'

const request = Promise.promisify(require('request'))

// 下载对账单
export default function LoadBalance() {}

/**
 * 下载微信对账单 
 *  @param {Object} time 对账单时间
 */
LoadBalance.wx = (time = new Date(new Date().getTime() - 86400000)) => {
    let _config = configInfo.weixin_config
    // 上一天的时间
    let year = time.getFullYear()
    let month = (time.getMonth() + 1) < 10 ? "0" + (time.getMonth() + 1) : time.getMonth()
    let day = time.getDate() < 10 ? "0" + time.getDate() : time.getDate()

    // 设置请求参数
    let requestParams = {
        'appid': _config.appid,
        'mch_id': _config.mchid,
        'nonce_str': Math.random().toString(36).substr(2, 15),
        'bill_date': `${year+month+day}`,
        'bill_type': 'ALL'
    }

    // 设置签名
    let signKey = _config.key
    requestParams.sign = wx_signHelper.getSignContent(requestParams, signKey, false)

    let builder = new xml2js.Builder()
    let form = builder.buildObject(requestParams)

    request({
        url: configInfo.balanceUrl.wx, 
        method: 'POST', 
        body: form,
        json: false
    }).then(res => {
        let result = res.body
        if(result[0] == '<') {
            xml2js.parseString(result, (err, errInfo) => {
                if(errInfo.xml.return_code == 'FAIL') {
                    console.error(`wx loadBalance error: ${errInfo.xml.return_msg}`)
                }
            })
        } else {
            let row_data = result.split('\n')
            console.log(row_data[1])
        }
    }).catch(e => {
        console.log(`wx loadBalance error: ${e}`)
    })
}

/**
 * 下载支付宝对账单
 */
LoadBalance.alipay = () => {

}