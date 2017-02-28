import koaRouter from 'koa-router'
import alipay from '../controllers/alipay'

const router = koaRouter({
    prefix: '/ali'
})

router.get('/tradePay', alipay.tradePay)

module.exports = router