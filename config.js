import fs from 'fs'

export const alipay_config = {
    /* 应用ID */
    'appid': 2016073100135366,

    /* 通知URL */
    'notifyUrl': '',

    /* 应用RSA私钥 请勿忘记 ----BEGIN RSA PRIVATE KEY----- 与 -----END RSA PRIVATE KEY-----  */
    'merchantPrivateKey': `-----BEGIN RSA PRIVATE KEY-----
MIICXAIBAAKBgQChWouYGhW8wXl+qWzkq7QtCK6MvodD+9jiLX1JwBWrE7pwlnPuAVNVo7CQmgksxIcFdy3GtazgK5TYga628Ev1FQc2bY2vCNBzxjUie/1cJ2jsz0q0gLolZIRXU7TFOaROi0CHr2JmqMQvSxCFwqxCr7trIPgN2EnqhCboTy8OswIDAQABAoGBAKFWw3ycoJ20LAMd8HeaxTe+laLAJMsyucQ3Ti7/desxd9x6ZINZKfXZDoUYsRHllUk+yTQHl0wz58qxqXzdPGTGXfcu2qkBIJFq7GKc9o/ciSZm0WcgT6wteMoeCr0mYaDtIi1m2Lo+oUR9nNGxKHFBCpWOwZwvvcfmInjHOZXxAkEAzckiiapBl1YaBpOrTlwOQWlTky7Jl13Km7g+P6Dl1IEaKnIOk3MXILrwGD9T3VJDkXbdlYNOxEKp8dR1snZH2wJBAMi53cIC7DMqj6UxJXKvelnE2SZjsF6A2AIZP/8BmtitrsZvWrdRN1o01u3migIYbGzrQDOa3OFCSxWcpCX+GAkCQEyLKQ6dxqH9A9c4bDrMYP0RqWWQvKlR2MANSxItze86SjpJjIRqBctF3XKXc6FaLQnZddhcLBsyVLY/+bt05YsCQGt5KUVB71oOBc97GwPm9Omvvl0Rr1NKRV4KSvuszk4J4LSa1sWklLCV7iZ+85Hfpd5Dr6Jx3qY1qqIttq4o+JECQHRqOLC6OxFVNim5xQ6CnKOgDMjTI5djYX86Tx1tse27hRoNwwft1bQXt6PT+J+hGMnjGv2Hjmtv+dBENJxtN/8=
-----END RSA PRIVATE KEY-----`,

    /* 支付宝支付网关 如果为空会使用沙盒网关 */
	'gatewayUrl': '',

    /* 最大查询重试次数 */
    'maxQueryRetry': 10,

    /* 查询间隔 */
    'queryDuration': 3000,

    /* 系统商编号 */
    'pid': 2088521499170282,
}

export const weixin_config = {
    /* 应用ID */
    'appid': 'wxf44a04199d6dc74b',

    /* 支付密钥 */
    //正式签名  njytdev1njytdev1njytdev1njytdev1
    //沙箱环境  ABCDEFGHIJKLMNOPQRSTUVWXYZ123456
    'key': 'njytdev1njytdev1njytdev1njytdev1',

    /* 应用密钥 */
    'appSecret': 'a1882a694055a1aaa84d225ddeaac81f',
    
    /* 商户号 */
    'mchid': '1430438902',

    /* 最大查询重试次数 */
    'maxQueryRetry': 6,

    /* 查询间隔 */
    'queryDuration': 5000,

    /* 刷卡支付请求接口 */
    //https://api.mch.weixin.qq.com/pay/micropay
    'microPayUrl': 'https://api.mch.weixin.qq.com/sandboxnew/pay/micropay',

    /* 查询订单请求接口 */
    'orderQueryUrl': 'https://api.mch.weixin.qq.com/sandboxnew/pay/orderquery',

    /* 撤销订单请求接口 */
    'reverseUrl': 'https://api.mch.weixin.qq.com/sandboxnew/secapi/pay/reverse',

    /* 微信商户平台证书 */
    'pfx': fs.readFileSync('./apiclient_cert.p12'),
}

// 对账单api
export const balanceUrl = {
    'wx': 'https://api.mch.weixin.qq.com/pay/downloadbill'
}