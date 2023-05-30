const onMessage = async message => {
  if (message.substr(0, 8).toLowerCase() === 'convert ') {
    const q = message.substr(8)
    const matches = q.match(/([0-9]*)[ ]*([A-z][A-z][A-z])[ ]+to[ ]+([A-z][A-z][A-z])/)
    const value = parseFloat(matches[1]) || 1
    const from = matches[2].toUpperCase()
    const to = matches[3].toUpperCase()
    const r = await fetch(`https://api.exchangerate.host/lates?base=${from}&symbols=${to}`)
    const data = await r.json()
    const rate = data.rates[to]
    return (rate * value).toFixed(2)
  }
}

module.exports = {
  onMessage: onMessage
}
