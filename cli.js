#!/usr/bin/env node
const octokit = require('@octokit/rest')

const eventPath = process.env.GITHUB_EVENT_PATH || require.resolve('./event.json')
const event = require(eventPath)

const {after: sha, repository} = event
const branch = event.ref.split('/').slice(2).join('/')
const owner = repository.owner.name
const repo = repository.name

console.log('!', {sha, branch, owner, repo})

const github = octokit()
if (process.env.GITHUB_TOKEN) {
  github.authenticate({
    type: 'token',
    token: process.env.GITHUB_TOKEN
  })
}

const payload = {
}

github.repos.createStatus({
  owner,
  repo,
  sha,
  state: 'success',
  context: process.env.STATUS_CONTEXT || 'now/preview',
  description: process.env.STATUS_DESCRIPTION || 'Your preview is up-to-date',
  target_url: `https://primer-${branch}.now.sh`
})
.then(res => {
  console.log('success!')
})
.catch(error => {
  console.error('Error:', error)
  process.exitCode = 1
})
