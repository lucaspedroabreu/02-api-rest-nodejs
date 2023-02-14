import { app } from './app'
import { env } from './env'

app.listen(
  {
    port: env.PORT,
  },
  () => {
    console.log('HTTP Server up!')
    console.log('Server running...')
  },
)
