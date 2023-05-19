const config = require('../../config')
let apiKey = config.get('translate_apiKey')

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
      config.set('translate_apiKey', apiKey)
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
      source_language: 'en',
      translation_language: 'ru'
    }).toString()
    const response = await fetch('https://translation-api.translate.com/translate/v1/mt', {
      method: 'POST',
      body: body,
      headers: {'x-api-key': apiKey, 'Content-Type': 'application/x-www-form-urlencoded'}
    })
    const data = await response.json()
    return data.translation || q
  }
}

module.exports = {
  init: init,
  onMessage: onMessage
}
