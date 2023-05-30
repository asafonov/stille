const bot = require('./src/bot/matrix')
const weather = require('./src/plugins/weather')
const translate = require('./src/plugins/translate')
const convert = require('./src/plugins/convert')

const app = async () => {
  bot.init([weather, translate, convert])
}

app()
