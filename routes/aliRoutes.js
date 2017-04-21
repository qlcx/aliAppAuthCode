import koaRouter from 'koa-router'
import aliAuth from '../controllers/aliAuth'

const router = koaRouter({
    prefix: '/ali'
})

router.get('/appAuthCode', aliAuth.authRoute)

module.exports = router