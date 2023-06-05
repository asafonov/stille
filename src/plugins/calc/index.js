const onMessage = async message => {
  if (message.substr(0, 5).toLowerCase() === 'calc ') {
    const q = message.substr(5).replace(/[^0-9\+\-\*\/\(\) ]/g, '')
    try {
      return eval(q) + ''
    } catch {
      return `There is no way "${message.substr(5)}" has a meaning`
    }
  }
}

module.exports = {
  onMessage: onMessage
}
