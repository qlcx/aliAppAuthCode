import fs from 'fs'
import path from 'path'
import koaRouter from 'koa-router'

const router = koaRouter()

fs.readdirSync(__dirname).filter(file => 
  (file.indexOf('.') !== 0) && (file.split('.').slice(-1)[0] === 'js') && file !== 'index.js'  
).forEach(file => {
    const route = require(path.join(__dirname, file))
    router.use(route.routes(), route.allowedMethods())
})

router.get('/', (ctx, next) => {
    ctx.body = 'home page'
})

export default router