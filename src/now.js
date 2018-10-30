const nowFetch = require('now-fetch')({
  token: process.env.ZEIT_TOKEN
})

function getRelevantDeployment(host) {
  return nowFetch('/v2/now/deployments').then(({deployments}) => {
    return deployments.find(d => d.url === host)
  })
}

module.exports = {
  getRelevantDeployment
}
