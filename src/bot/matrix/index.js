const sdk = require("matrix-js-sdk")
const config = require('../../config').init()

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

const login = async f => {
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
        f(matrix)
      }
    })
  } else {
    matrix = sdk.createClient(
      getConnectData({
        accessToken: accessToken,
      })
    )
    f(matrix)
  }
}

const subscribe = (matrix, plugins) => {
  matrix.startClient()
  const userId = config.get('userId')

  matrix.on('RoomMember.membership', (event, member) => {
    if (member.membership === 'invite' && member.userId === userId) {
      matrix.joinRoom(member.roomId)
    }
  })

  matrix.on('Room.timeline', async (event, room, toStartOfTimeline) => {
    if (toStartOfTimeline) {
      return
    }

    if (event.getType() !== 'm.room.message') {
      return
    }

    if (event.sender.userId === userId) {
      return
    }

    const age = new Date().getTime() - event.localTimestamp

    if (age > 60000) {
      return
    }

    for (let i = 0; i < plugins.length; ++i) {
      const reply = await plugins[i].onMessage(event.getContent().body)
      reply && matrix.sendEvent(room.roomId, 'm.room.message', {msgtype: 'm.text', body: reply}, '')
    }
  })
}

const initPlugins = (plugins, f) => {
  const fs = []

  for (let i = 0; i < plugins.length; ++i) {
    const _f = i === 0 ? f : fs[i - 1]
    fs[i] = 'init' in plugins[i] ? () => plugins[i].init(_f) : _f
  }

  fs[fs.length - 1]()
}

const init = plugins => {
  login(matrix => {
    initPlugins(plugins, () => {
      subscribe(matrix, plugins)
    })
  })
}

module.exports = {
  init: init
}
