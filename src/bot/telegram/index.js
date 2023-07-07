const {TelegramClient} = require('telegram')
const {StringSession} = require('telegram/sessions')
const {NewMessage} = require('telegram/events')
const input = require('input')
const cache = require('../../config').init('cache')
const config = require('../../config').init()
const antispam = require('../../utils/antispam')
let client

const getMessage = async message => {
  const sender = await message.getSender()
  const chat = await message.getChat()
  return {
    text: message.text,
    sender: sender.username || sender.phone || sender.id,
    title: chat?.title,
    chatId: chat?.id + '',
    self: sender.self
  }
}

const initApi = async () => {
  let apiId = config.get('apiId')
  let apiHash = config.get('apiHash')
  let botToken = config.get('botToken')
  let bot

  if (! apiId) {
    apiId = await input.text('api id: ')
    apiHash = await input.text('api hash: ')
    botToken = await input.text('bot auth token: ')
    apiId = parseInt(apiId)
    config.set('apiId', apiId)
    config.set('apiHash', apiHash)
    config.set('botToken', botToken)
    config.save()
  }

  return [apiId, apiHash, botToken]
}

const subscribe = plugins => {
  client.addEventHandler(async event => {
    const message = await getMessage(event.message)

    if (! antispam.isAllowedMessage(message.sender, message.chatId)) {
      console.log('SPAM', message.sender, message.chatId)
      const antispamErrorMessage = 'Sorry, the administrator of the bot did not allow me to react to your messages'
      sendMessage(message.chatId, antispamErrorMessage)
      return
    }

    for (let i = 0; i < plugins.length; ++i) {
      const reply = await plugins[i].onMessage(message.text, message.chatId)
      reply && sendMessage(message.chatId, reply)
    }
  }, new NewMessage({}))
}

const initPlugins = (plugins, f) => {
  const fs = []

  for (let i = 0; i < plugins.length; ++i) {
    const _f = i === 0 ? f : fs[i - 1]
    fs[i] = 'init' in plugins[i] ? () => plugins[i].init(_f) : _f
  }

  fs[fs.length - 1]()
}

const init = async plugins => {
  const [apiId, apiHash, botToken] = await initApi()
  const session = new StringSession(cache.get('session') || '')
  client = new TelegramClient(session, apiId, apiHash, {connectionRetries: 5})
  await client.start({
    botAuthToken: botToken,
    onError: e => console.error(e)
  })
  cache.set('session', client.session.save())
  cache.save()

  initPlugins(plugins, () => {
    subscribe(plugins)
  })
}

const sendMessage = (to, message) => {
  client.sendMessage(to, {message: message})
}

module.exports = {
  init: init
}
