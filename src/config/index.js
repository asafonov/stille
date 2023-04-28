const filename = process.env.HOME + '/.config/mtrxrc'
let config
const save = () => {
  let data = 'module.exports = {\n'

  for (let k in config) {
    data += `  ${k}: ${JSON.stringify(config[k])},\n`
  }

  data += '}'
  const fs = require('fs')
  fs.writeFileSync(filename, data)
}
const get = name => config[name]
const set = (name, value) => config[name] = value
const unset = name => delete config[name]

try {
  config = require(process.env.HOME + '/.config/mtrxrc')
} catch {
  config = {homeserver: 'https://matrix.org'}
}
module.exports = {get: get, set: set, unset: unset, save: save}
