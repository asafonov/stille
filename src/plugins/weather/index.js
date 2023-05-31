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

const formatTemp = temp => {
  return Math.floor(temp - 273)
}

const formatWeatherData = data => {
  return `${formatTemp(data.main.temp)}, ${data.weather[0].description}, feels like ${formatTemp(data.main.feels_like)}\nWind: ${data.wind.speed}m/s, ${getWindDirection(data.wind.direction)}\nClouds: ${data.clouds.all}%, Rain: ${data.rain ? (data.rain['3h'] ? '3h - ' + data.rain['3h'] : '1h - ' + data.rain['1h']) : '0'}mm\nPressure: ${Math.floor((data.main.grnd_level || data.main.sea_level || data.main.pressure || 0) * 0.75006)}mmHg, Humidity: ${data.main.humidity}%`
}

const requestApi = async (type, place) => {
  const api = `https://api.openweathermap.org/data/2.5/${type}?q=${place}&APPID=${apiKey}`
  const response = await fetch(api)
  const data = await response.json()
  return data
}

const weather = async place => {
  const data = await requestApi('forecast', place)
  const now = await requestApi('weather', place)
  const ret = [`now: ${formatWeatherData(now)}`]

  for (let i = 0; i < 5; ++i) {
    const date = new Date(data.list[i].dt * 1000 + data.city.timezone * 1000).toISOString().substr(11, 5)
    ret.push(date + ': ' + formatWeatherData(data.list[i]))
  }

  return ret.join('\n\n')
}

const forecast = async place => {
  const data = await requestApi('forecast', place)
  const ret = {}

  for (let i = 0; i < data.list.length; ++i) {
    const w = data.list[i]
    const date = new Date(data.list[i].dt * 1000 + data.city.timezone * 1000).toISOString()
    const day = date.substr(0, 10)
    const hour = date.substr(11, 2)
    if (! ret[day]) ret[day] = {}

    if (! ret[day].day || (hour > 12 && hour <=15)) {
      ret[day].day = formatTemp(w.main.temp)
    }

    if (! ret[day].night || hour > 1 && hour <= 4) {
      ret[day].night = formatTemp(w.main.temp)
    }
  }
}

const onMessage = async message => {
  if (message.substr(0, 11).toLowerCase() === 'weather in ') {
    const place = message.substr(11)
    return await weather(place)
  } else if (message.substr(0, 12).toLowerCase() === 'forecast in ') {
    const place = message.substr(12)
    return await forecast(place)
  }
}

module.exports = {
  init: init,
  onMessage: onMessage
}
