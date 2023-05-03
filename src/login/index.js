const showLoginForm = f => {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })
  readline.question('host: ', host => {
    readline.question('user: ', user => {
      readline.question('password: ', password => {
        readline.close()
          return f(host, user, password)
      })
    })
  })
}

const getAccessToken = async (userId, password, matrix) => {
  const response = await matrix.login('m.login.password', {
    user: userId,
    password: password
  })
  return response.access_token
}

genConfigData = (user, host) => {
  return {
    baseUrl: `https://${host}`,
    userId: `@${user}:${host}`,
    deviceId: `mtrxrc`
  }
}

module.exports.login = async () => {
  const sdk = require("matrix-js-sdk")
  const config = require('../config')
  let accessToken = config.get('accessToken')
  let matrix

  if (! accessToken) {
    showLoginForm(async (host, user, password) => {
      const data = genConfigData(user, host)
      matrix = sdk.createClient(data)
      await matrix.initCrypto()
      accessToken = await getAccessToken(user, password, matrix)

      if (accessToken) {
        config.set('accessToken', accessToken)
        config.set('baseUrl', data.baseUrl)
        config.set('userId', data.userId)
        config.set('deviceId', data.deviceId)
        config.save()
        matrix.startClient()
      }
    })
  } else {
    const baseUrl = config.get('baseUrl')
    const userId = config.get('userId')
    const deviceId = config.get('deviceId')
    matrix = sdk.createClient({
      baseUrl: baseUrl,
      accessToken: accessToken,
      userId: userId,
      deviceId: deviceId
    })
    matrix.startClient()
  }
}
