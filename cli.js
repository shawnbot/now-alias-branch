#!/usr/bin/env node
const fs = require('fs')
const url = require('url')
const interpolate = require('interpolate')
const github = require('./src/octokit')
const getEventData = require('./src/event')
const getRelevantDeployment = require('./src/now')

const {
  GITHUB_EVENT_PATH,
  PREVIEW_URL_TEMPLATE,
  STATUS_CONTEXT,
  STATUS_DESCRIPTION
} = process.env

const eventPath = GITHUB_EVENT_PATH || require.resolve('./event.json')
const event = require(eventPath)

const {branch, ...data} = getEventData(event)
data.name = require('./now.json').name

const rootUrl = ROOT_URL || fs.readFileSync('/zeit-now.log', 'utf8').trim()
const rootDomain = url.parse(rootUrl).host

getRelevantDeployment(rootDomain).then(deployment => {
  const interps = Object.assign({}, deployment, data)
  const urlTemplate = PREVIEW_URL_TEMPLATE || '{name}-{branch}'
  const url = interpolate(urlTemplate, interps)
  return nowFetch(`/v2/now/deployments/${deployment.uid}/aliases`, {
    method: 'POST',
    data: {
      alias: url
    }
  })
  .catch(err => {
    throw new Error(`Unable to alias deployment: "${deployment.uid}" to "${url}": ${error}`)
  })
  .then(() => url)
})
.then(url => {
  Object.assign(data, {
    state: 'success'
    context: STATUS_CONTEXT || 'now/preview'
    description: STATUS_DESCRIPTION || 'Your preview is up-to-date',
    target_url: url
  })
  return github.repos.createStatus(data)
    .catch(error => {
      throw new Error(`Unable to create status with: ${JSON.stringify(data, null, 2)}: ${error}`)
    })
})
.then(res => {
  console.log('SUCCESS!')
})
.catch(error => {
  console.error('Error:', error)
  process.exitCode = 1
})
