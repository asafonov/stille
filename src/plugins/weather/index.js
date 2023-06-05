const config = require('../../config').init('weather')
let apiKey = config.get('apiKey')
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
      config.set('apiKey', apiKey)
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

const getConciseWindDirection = degrees => {
  if (degrees > 315 || degrees <= 45) {
    return 'N'
  } else if (degrees > 45 && degrees <= 135) {
    return 'E'
  } else if (degrees > 135 && degrees <= 225) {
    return 'S'
  } else {
    return 'W'
  }
}

const formatTemp = temp => {
  return Math.floor(temp - 273)
}

const formatWeatherData = data => {
  const rain = data.rain ? ', Rain: ' + (data.rain['3h'] ? data.rain['3h'] + 'mm/3h' : data.rain['1h'] + 'mm/h') : ''
  const snow = data.snow ? ', Snow: ' + (data.snow['3h'] ? data.snow['3h'] + 'mm/3h' : data.snow['1h'] + 'mm/h') : ''

  return `${formatTemp(data.main.temp)}, ${data.weather[0].description}, feels like ${formatTemp(data.main.feels_like)}\n`
    + `Wind: ${data.wind.speed}m/s, ${getWindDirection(data.wind.deg)}\n`
    + `Clouds: ${data.clouds.all}%${rain}${snow}\n`
    + `Pressure: ${Math.floor((data.main.grnd_level || data.main.sea_level || data.main.pressure || 0) * 0.75006)}mmHg, Humidity: ${data.main.humidity}%`
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

const isDay = hour => hour >=9 && hour < 21
const getDayOrNight = hour => isDay(hour) ? 'day' : 'night'

const forecast = async place => {
  const data = await requestApi('forecast', place)
  const ret = {}

  for (let i = 0; i < data.list.length; ++i) {
    const w = data.list[i]
    const date = new Date(data.list[i].dt * 1000 + data.city.timezone * 1000)
    const isoDate = date.toISOString()
    const day = isoDate.substr(0, 10)
    const hour = isoDate.substr(11, 2)
    if (! ret[day]) ret[day] = {
      day: {
        temp: null,
        descr: {},
        wind: {},
        speed: {min: null, max: null},
        rain: 0,
        snow: 0,
        clouds: {min: null, max: null}
      },
      night: {
        temp: null,
        descr: {},
        wind: {},
        speed: {min: null, max: null},
        rain: 0,
        snow: 0,
        clouds: {min: null, max: null}
      },
      dayOfWeek: days[date.getDay()]
    }

    if (ret[day].day.temp === null || (hour > 12 && hour <=15)) {
      ret[day].day.temp = formatTemp(w.main.temp)
    }

    if (ret[day].night.temp === null || hour > 1 && hour <= 4) {
      ret[day].night.temp = formatTemp(w.main.temp)
    }

    const dayOrNight = getDayOrNight(hour)
    ret[day][dayOrNight].descr[w.weather[0].main] = (ret[day][dayOrNight].descr[w.weather[0].main] || 0) + 1
    const wd = getConciseWindDirection(w.wind.deg)
    ret[day][dayOrNight].wind[wd] = (ret[day][dayOrNight].wind[wd] || 0) + 1
    ret[day][dayOrNight].rain += w.rain ? w.rain['3h'] || w.rain['1h'] : 0
    ret[day][dayOrNight].snow += w.snow ? w.snow['3h'] || w.snow['1h'] : 0

    if (ret[day][dayOrNight].speed.min === null || w.wind.speed < ret[day][dayOrNight].speed.min) {
      ret[day][dayOrNight].speed.min = w.wind.speed
    }

    if (ret[day][dayOrNight].speed.max === null || w.wind.speed > ret[day][dayOrNight].speed.max) {
      ret[day][dayOrNight].speed.max = w.wind.speed
    }

    if (ret[day][dayOrNight].clouds.min === null || w.clouds.all < ret[day][dayOrNight].clouds.min) {
      ret[day][dayOrNight].clouds.min = w.clouds.all
    }

    if (ret[day][dayOrNight].clouds.max === null || w.clouds.all > ret[day][dayOrNight].clouds.max) {
      ret[day][dayOrNight].clouds.max = w.clouds.all
    }
  }

  const f = []

  for (let i in ret) {
    let s = `${ret[i].dayOfWeek}, ${i}`

    for (let dayOrNight of ['day', 'night']) {
      const descr = Object.keys(ret[i][dayOrNight].descr)
      const wind = Object.keys(ret[i][dayOrNight].wind)
      wind.sort((a, b) => ret[i][dayOrNight].wind[a] > ret[i][dayOrNight].wind[b] ? -1 : 1)
      const windSpeed = ret[i][dayOrNight].speed.min < ret[i][dayOrNight].speed.max ? ret[i][dayOrNight].speed.min + ' - ' + ret[i][dayOrNight].speed.max + 'm/s' : ret[i][dayOrNight].speed.max + 'm/s'
      const clouds = ret[i][dayOrNight].clouds.min < ret[i][dayOrNight].clouds.max ? ret[i][dayOrNight].clouds.min + ' - ' + ret[i][dayOrNight].clouds.max + '%' : ret[i][dayOrNight].clouds.max + '%'

      if (descr.length > 0) {
        s += `\n${dayOrNight}: ${ret[i][dayOrNight].temp}, ${descr.join(', ')}. Wind: ${wind[0]}, ${windSpeed}\nClouds: ${clouds}`
        s += ret[i][dayOrNight].rain ? `, Rain: ${ret[i][dayOrNight].rain.toFixed(2)}mm` : ''
        s += ret[i][dayOrNight].snow ? `, Snow: ${ret[i][dayOrNight].snow.toFixed(2)}mm` : ''
      }
    }

    f.push(s)
  }

  return f.join('\n\n')
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
