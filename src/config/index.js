const name = process.argv[2] || 'mtrxrc'
const filename = `${process.env.HOME}/.config/${name}.mtrxrc`
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
const join = data => config = {...config, ...data}

try {
  config = require(process.env.HOME + '/.config/mtrxrc')
} catch {
  config = {}
}
module.exports = {get: get, set: set, unset: unset, join: join, save: save}
