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

const onMessage = async message => {
  if (message.substr(0, 11) === 'weather in ') {
    const place = message.substr(11)
    const api = `https://api.openweathermap.org/data/2.5/weather?q=${place}&APPID=${apiKey}`
    const response = await fetch(api)
    const data = await response.json()
    return `${Math.floor(data.main.temp - 273)}, ${data.weather[0].main}`
  }
}

module.exports = {
  init: init,
  onMessage: onMessage
}
