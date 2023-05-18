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

const getWindDirection = degrees => {
  if (degrees > 348.75 || degrees <= 11.25) {
    return 'N'
  } else if (degrees > 11.25 && degrees <= 33.75) {
    return 'NNE'
  } else if (degrees > 33.75 && degrees <= 56.25) {
    return 'NE'
  } else if (degrees > 56.25 && degrees <= 78.75) {
    return 'ENE'
  } else if (degrees > 78.75 && degrees <= 101.25) {
    return 'E'
  } else if (degrees > 101.25 && degrees <= 123.75) {
    return 'ESE'
  } else if (degrees > 123.75 && degrees <= 146.25) {
    return 'SE'
  } else if (degrees > 146.25 && degrees <= 168.75) {
    return 'SSE'
  } else if (degrees > 168.75 && degrees <= 191.25) {
    return 'S'
  } else if (degrees > 191.25 && degrees <= 213.75) {
    return 'SSW'
  } else if (degrees > 213.75 && degrees <= 236.25) {
    return 'SW'
  } else if (degrees > 236.25 && degrees <= 258.75) {
    return 'WSW'
  } else if (degrees > 258.75 && degrees <= 281.25) {
    return 'W'
  } else if (degrees > 281.25 && degrees <= 303.75) {
    return 'WNW'
  } else if (degrees > 303.75 && degrees <= 326.25) {
    return 'NW'
  } else {
    return 'NNW'
  }
}

const onMessage = async message => {
  if (message.substr(0, 11) === 'weather in ') {
    const place = message.substr(11)
    const api = `https://api.openweathermap.org/data/2.5/weather?q=${place}&APPID=${apiKey}`
    const response = await fetch(api)
    const data = await response.json()
    return `${Math.floor(data.main.temp - 273)}, ${data.weather[0].description}, feels like ${Math.floor(data.main.feels_like - 273)}\nWind: ${data.wind.speed}m/s, ${getWindDirection(data.wind.direction)}\nPressure: ${Math.floor((data.main.grnd_level || data.main.sea_level || data.main.pressure || 0) * 0.75006)}mmHg\nHumidity: ${data.main.humidity}%`
  }
}

module.exports = {
  init: init,
  onMessage: onMessage
}
