const myUserId = "@asafonov.org:matrix.org"
const myAccessToken = ""
const sdk = require("matrix-js-sdk")
const matrixClient = sdk.createClient({
  baseUrl: "https://matrix.org",
  accessToken: myAccessToken,
  userId: myUserId,
})

matrixClient.startClient(20)
