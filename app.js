const bot = require('./src/bot/matrix')
const weather = require('./src/plugins/weather')
const translate = require('./src/plugins/translate')
const convert = require('./src/plugins/convert')

const app = async () => {
  const plugins = process.argv[3] ? eval(`[${process.argv[3]}]`) : [weather, translate, convert]
  bot.init(plugins)
}

app()
