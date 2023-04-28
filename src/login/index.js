const showLoginForm = f => {
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  })
  readline.question('userId: ', userId => {
    readline.question('password: ', password => {
      readline.close()
      return f(userId, password)
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

module.exports.login = async () => {
  const sdk = require("matrix-js-sdk")
  const config = require('../config')
  const baseUrl = config.get('homeserver')
  let accessToken = config.get('accessToken')
  const userId = config.get('userId')
  const data = {baseUrl: baseUrl}

  if (accessToken) {
    data['accessToken'] = accessToken
    data['userId'] = userId
  }

  const matrix = sdk.createClient(data)

  if (! accessToken) {
    showLoginForm(async (userId, password) => {
      const accessToken = await getAccessToken(userId, password, matrix)

      if (accessToken) {
        config.set('userId', userId)
        config.set('accessToken', accessToken)
        config.save()
        matrix.startClient()
      }
    })
  } else {
    matrix.startClient()
  }

}
