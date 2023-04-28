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

const getAccessToken = async (userId, password) => {
  const response = await matrixClient.login('m.login.password', {
    user: userId,
    password: password
  })
  return response.access_token
}

module.exports.login = async () => {
  const sdk = require("matrix-js-sdk")
  const baseUrl = 'https://matrix.org'
  let accessToken
  const data = {baseUrl: baseUrl}

  if (accessToken) {
    data['accessToken'] = accessToken
    data['userId'] = userId
  }

  const matrixClient = sdk.createClient(data)

  if (! accessToken) {
    showLoginForm(async (userId, password) => {
      const accessToken = await getAccessToken(userId, password)
      accessToken && matrixClient.startClient()
    })
  } else {
    matrixClient.startClient()
  }

}
