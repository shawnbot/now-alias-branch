#!/usr/bin/env node
const fs = require('fs')
const url = require('url')
const interpolate = require('interpolate')
const github = require('./src/octokit')
const getEventData = require('./src/event')
const getRelevantDeployment = require('./src/now')

const {
  GITHUB_EVENT_PATH,
  NOW_APP_NAME = require('./now.json').name,
  PREVIEW_URL_TEMPLATE = '{app}-{branch}',
  ROOT_URL = fs.readFileSync('/zeit-now.log', 'utf8').trim(),
  STATUS_CONTEXT = 'now/preview',
  STATUS_DESCRIPTION = 'Your preview is up-to-date'
} = process.env

const eventPath = GITHUB_EVENT_PATH || require.resolve('./event.json')
const event = require(eventPath)

const {branch, ...data} = getEventData(event)
const app = NOW_APP_NAME || require('./now.json').name

const rootUrl = ROOT_URL || fs.readFileSync('/zeit-now.log', 'utf8').trim()
const rootDomain = url.parse(rootUrl).host

getRelevantDeployment(rootDomain).then(deployment => {
  const interps = Object.assign({}, deployment, data)
  const url = interpolate(PREVIEW_URL_TEMPLATE, interps)
  return nowFetch(`/v2/now/deployments/${deployment.uid}/aliases`, {
    method: 'POST',
    data: {
      app: 
      alias: url
    }
  })
  .catch(err => {
    throw new Error(`Unable to alias deployment: "${deployment.uid}" to "${url}": ${error}`)
  })
  .then(url => {
    Object.assign(data, {
      state: 'success',
      context: STATUS_CONTEXT,
      description: STATUS_DESCRIPTION,
      target_url: url
    })
    return github.repos.createStatus(data)
      .catch(error => {
        throw new Error(`Unable to create status with payload: ${JSON.stringify(data, null, 2)}: ${error}`)
      })
  })
})
.then(res => {
  console.log('SUCCESS!')
})
.catch(error => {
  console.error('Error:', error)
  process.exitCode = 1
})
