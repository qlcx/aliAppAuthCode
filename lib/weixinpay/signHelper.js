import crypto from 'crypto'

/**
 * 根据Object键名来排序
 * @param   {Object} obj 需要排序的Object
 * @returns {Object}
 */
const sortObject = (obj) => {
    return Object.keys(obj).sort().reduce((r, k) => (r[k] = obj[k], r), {})
}

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
 * 生成签名内容
 * @param {Object} params api公有参数
 * @param {String} key api密钥
 * @param {Boolean} urlEncodeBool 是否将value进行url编码
 */
const getSignContent = (params, key, urlEncodeBool) => {
    var temp = []
    Object.keys(params).forEach(function(key) {
        temp[key] = params[key]
    })

    temp = sortObject(temp)
    let formatData = formatParams(temp, true, urlEncodeBool)

    //拼接API密钥&md5加密
    return crypto
        .createHash('md5')
        .update(`${formatData}&key=${key}`,'utf8')
        .digest('hex').toUpperCase()
}

export default {
    getSignContent,
}