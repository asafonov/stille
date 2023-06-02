const config = require('../../config').init()
const configPrefix = 'translate_'
let apiKey = config.get(`${configPrefix}apiKey`)

const showSettingsForm = f => {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })
  readline.question('Translate.com API Key: ', apiKey => {
    readline.close()
    return f(apiKey)
  })
}

const init = f => {
  if (! apiKey) {
    showSettingsForm(apiKey => {
      apiKey = apiKey
      config.set(`${configPrefix}apiKey`, apiKey)
      config.save()
      f()
    })
  } else {
    f()
  }
}

const onMessage = async message => {
  if (message.substr(0, 10).toLowerCase() === 'translate ') {
    const q = message.substr(10)
    const body = new URLSearchParams({
      text: q,
      source_language: config.get(`${configPrefix}from`) || 'en',
      translation_language: config.get(`${configPrefix}to`) || 'ru'
    }).toString()
    const response = await fetch('https://translation-api.translate.com/translate/v1/mt', {
      method: 'POST',
      body: body,
      headers: {'x-api-key': apiKey, 'Content-Type': 'application/x-www-form-urlencoded'}
    })
    const data = await response.json()
    return data.translation || q
  } else if (message.substr(0, 11).toLowerCase() === '!translate ') {
    const q = message.substr(11).split(' ')
    config.set(`${configPrefix}${q[0]}`, q[1])
    config.save()
  }
}

module.exports = {
  init: init,
  onMessage: onMessage
}
