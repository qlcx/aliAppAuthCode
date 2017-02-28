import koaRouter from 'koa-router'
import weixinpay from '../controllers/weixinpay'

const router = koaRouter({
    prefix: '/weixin'
})

router.get('/microPay', weixinpay.microPay)

module.exports = router