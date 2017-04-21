import crypto from 'crypto'

/**
 * 格式化参数信息
 * @param   {Object}   params         params
 * @param   {Boolean}  skipEmptyValue 是否跳过 value 为空的object
 * @param   {Boolean}  urlEncodeValue 是否将value进行url编码
 * @returns {String}
 */
const formatParams = (params, skipEmptyValue, urlEncodeValue) => {
    let content = "";

    Object.keys(params).forEach(function(key, idx) {
        let value = params[key];
        if(value == "" && skipEmptyValue) {
            return;
        }

        if(urlEncodeValue) {
            value = encodeURIComponent(value);
        }

        if(idx == 0) {
            content += `${key}=${value}`
        } else {
            content += `&${key}=${value}`
        }
    })

    return content;
}

/**
 * 根据Object键名来排序
 * @param   {Object} obj 需要排序的Object
 * @returns {Object}
 */
const sortObject = (obj) => {
    return Object.keys(obj).sort().reduce((r, k) => (r[k] = obj[k], r), {})
}

/**
 * 生成签名
 * @param   {String} content     签名内容
 * @param   {String} privateKey  私钥
 * @returns {String} 
 */
const getSign = (content, privateKey) => {
    var cryptoSign = crypto.createSign("RSA-SHA1")
    cryptoSign.update(content, "utf8")
    return cryptoSign.sign(privateKey, "base64")
}

/**
 * 生成签名内容
 * @param {Object} sysParams api公有参数
 * @param {Object} apiParams api自有参数
 * @param {Boolean} urlEncodeBool 是否将value进行url编码
 */
const getSignContent = (sysParams, apiParams, urlEncodeBool) => {
    var temp = []
    Object.keys(sysParams).forEach(function(key) {
        temp[key] = sysParams[key]
    })
    Object.keys(apiParams).forEach(function(key) {
        temp[key] = apiParams[key]
    })

    temp = sortObject(temp)
    return formatParams(temp, true, urlEncodeBool)
}

export default {
    formatParams,
    sortObject,
    getSign,
    getSignContent,
}

