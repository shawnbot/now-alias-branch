#!/usr/bin/env node
const fs = require('fs')
const interpolate = require('interpolate')
const url = require('url')
const {join} = require('path')
const github = require('./src/octokit')
const {getRelevantDeployment, nowFetch} = require('./src/now')

const {
  GITHUB_EVENT_PATH = require.resolve('./event.json'),
  GITHUB_REPOSITORY,
  GITHUB_SHA,
  NOW_JSON_PATH = join(process.cwd(), 'now.json'),
  NOW_APP_NAME: app = require(NOW_JSON_PATH).name,
  PREVIEW_URL_TEMPLATE = '{app}-{branch}.now.sh',
  ROOT_URL = fs.readFileSync('/github/workflow/zeit-now.log', 'utf8').trim(),
  STATUS_CONTEXT = 'preview/url',
  STATUS_DESCRIPTION = 'Your preview is up-to-date with {sha}'
} = process.env

const event = require(GITHUB_EVENT_PATH)
const rootDomain = url.parse(ROOT_URL).host

getRelevantDeployment(rootDomain).then(deployment => {
  console.warn('relevant deployment:', deployment)
  const branch = event.ref.split('/').slice(2).join('/')
  const data = {
    app,
    repo: GITHUB_REPOSITORY,
    sha: GITHUB_SHA,
    branch,
    uid: deployment.uid
  }
  const host = interpolate(PREVIEW_URL_TEMPLATE, data)
  console.warn('alias host:', host)
  return nowFetch(`/v2/now/deployments/${deployment.uid}/aliases`, {
    method: 'post',
    body: JSON.stringify({alias: host}),
    headers: {
      'content-type': 'application/json'
    }
  })
  .catch(err => {
    throw new Error(`Unable to alias deployment: "${deployment.uid}" to "${host}": ${error}`)
  })
  .then(() => {
    const [owner, repo] = GITHUB_REPOSITORY.split('/')
    data.host = host
    const payload = {
      owner,
      repo,
      sha: GITHUB_SHA,
      state: 'success',
      context: interpolate(STATUS_CONTEXT, data),
      description: interpolate(STATUS_DESCRIPTION, data),
      target_url: `https://${host}`
    }
    console.log('status payload:', payload)
    return github.repos.createStatus(payload)
      .catch(error => {
        throw new Error(`Unable to create status with payload: ${JSON.stringify(payload, null, 2)}: ${error}`)
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
