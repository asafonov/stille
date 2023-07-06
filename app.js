#!/usr/bin/env node

const whatKindOfBot = process.argv[2]?.replace(/[^A-z]/g, '') || 'matrix'

const bot = require(`./src/bot/${whatKindOfBot}`)
const weather = require('./src/plugins/weather')
const translate = require('./src/plugins/translate')
const convert = require('./src/plugins/convert')
const calc = require('./src/plugins/calc')

const app = async () => {
  const plugins = process.argv[3] ? eval(`[${process.argv[3]}]`) : [weather, translate, convert, calc]
  bot.init(plugins)
}

app()
