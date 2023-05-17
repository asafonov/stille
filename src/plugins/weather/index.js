const config = require('../../config')
let apiKey = config.get('weather_apiKey')

const showSettingsForm = f => {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })
  readline.question('OpenWeather API Key: ', apiKey => {
    readline.close()
    return f(apiKey)
  })
}

const init = f => {
  if (! apiKey) {
    showSettingsForm(apiKey => {
      apiKey = apiKey
      config.set('weather_apiKey', apiKey)
      config.save()
      f()
    })
  } else {
    f()
  }
}

const onMessage = (message) => {
  return `I've got the ${message}`
}

module.exports = {
  init: init,
  onMessage: onMessage
}
