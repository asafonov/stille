const config = require('../../config').init('antispam')
let configChanged = false
let allowedUsers = config.get('allowedUsers')

if (! allowedUsers) {
  configChanged = true
  allowedUsers = []
  config.set('allowedUsers', [])
}

let allowedRooms = config.get('allowedRooms')

if (! allowedRooms) {
  configChanged = true
  allowedRooms = []
  config.set('allowedRooms', [])
}

let rejectedUsers = config.get('rejectedUsers')

if (! rejectedUsers) {
  configChanged = true
  rejectedUsers = []
  config.set('rejectedUsers', [])
}

let rejectedRooms = config.get('rejectedRooms')

if (! rejectedRooms) {
  configChanged = true
  rejectedRooms = []
  config.set('rejectedRooms', [])
}

configChanged && config.save()

const isAllowedMessage = (userId, roomId) => {
  isUserAllowed = allowedUsers.indexOf(userId) > -1
  isUserRejected = rejectedUsers.indexOf(userId) > -1
  isRoomAllowed = allowedRooms.indexOf(roomId) > -1
  isRoomRejected = rejectedRooms.indexOf(roomId) > -1

  if (isUserRejected || isRoomRejected) return false
  if (allowedUsers.length > 0 && ! isUserAllowed) return false
  if (allowedRooms.length > 0 && ! isRoomAllowed) return false
  return true
}

module.exports = {
  isAllowedMessage: isAllowedMessage
}
