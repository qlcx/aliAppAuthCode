import koa from 'koa'
import router from './routes/index'

const app = new koa()

process.on('uncaughtException', e => {console.log(`Unexpected exception: ${e}`)})

app.use(router.routes(), router.allowedMethods())
app.listen(8888)

export default app