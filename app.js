const bot = require('./src/bot/matrix')
const weather = require('./src/plugins/weather')
const translate = require('./src/plugins/translate')

const app = async () => {
  bot.init([weather, translate])
}

app()
