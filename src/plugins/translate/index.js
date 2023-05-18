const config = require('../../config')
let apiKey = config.get('translate_apiKey')

const showSettingsForm = f => {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })
  readline.question('LibreTranslate API Key: ', apiKey => {
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
    const response = await fetch('https://libretranslate.com/translate', {
      method: 'POST',
      body: JSON.stringify({
        q: q,
        source: 'auto',
        target: 'ru',
        format: 'text',
        api_key: apiKey
      }),
      headers: {'Content-Type': 'application/json'}
    })
    const data = await response.json()
    return data.translatedText || q
  }
}

module.exports = {
  init: init,
  onMessage: onMessage
}
