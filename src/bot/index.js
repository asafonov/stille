const sdk = require("matrix-js-sdk")
const config = require('../config')

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

const genConfigData = (user, host) => {
  return {
    baseUrl: `https://${host}`,
    userId: `@${user}:${host}`
  }
}

const getConnectData = data => {
  const initialData = {
    baseUrl: config.get('baseUrl'),
    userId: config.get('userId')
  }
  return {...initialData, ...data}
}

const login = async (f) => {
  let accessToken = config.get('accessToken')
  let matrix

  if (! accessToken) {
    showLoginForm(async (host, user, password) => {
      const data = genConfigData(user, host)
      matrix = sdk.createClient(getConnectData(data))
      accessToken = await getAccessToken(user, password, matrix)

      if (accessToken) {
        config.set('accessToken', accessToken)
        config.set('baseUrl', data.baseUrl)
        config.set('userId', data.userId)
        config.save()
        matrix.startClient()
        f(matrix)
      }
    })
  } else {
    matrix = sdk.createClient(
      getConnectData({
        accessToken: accessToken,
      })
    )
    matrix.startClient()
    f(matrix)
  }
}

const init = onMessage => {
  login(matrix => {
    const userId = config.get('userId')
    matrix.on('RoomMember.membership', (event, member) => {
      if (member.membership === 'invite' && member.userId === userId) {
        matrix.joinRoom(member.roomId)
      }
    })
    matrix.on('Room.timeline', (event, room, toStartOfTimeline) => {
      if (toStartOfTimeline) {
        return
      }

      if (event.getType() !== 'm.room.message') {
        return
      }

      console.log(new Date().getTime() - event.localTimestamp, event.getContent().body)
    })
  })
}

module.exports = {
  init: init
}
