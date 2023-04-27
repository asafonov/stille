const userId = "@asafonov.org:matrix.org"
const accessToken = ""
const baseUrl = "https://matrix.org"
const sdk = require("matrix-js-sdk")
const init = async () => {
  const data = {baseUrl: baseUrl}

  if (accessToken) {
    data['accessToken'] = accessToken
    data['userId'] = userId
  }

  const matrixClient = sdk.createClient(data)

  if (! accessToken) {
    const response = await matrixClient.login('m.login.password', {
      user: userId,
      password: ''
    })
    console.log(response)
    console.log(response.access_token)
  }

  matrixClient.startClient(20)
}

init()
