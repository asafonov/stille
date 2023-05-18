const bot = require('./src/bot/matrix')
const weather = require('./src/plugins/weather')

const app = async () => {
  bot.init([weather])
}

app()
