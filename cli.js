#!/usr/bin/env node
const execa = require('execa')
const eventPath = process.env.GITHUB_EVENT_PATH || require.resolve('./event.json')
const event = require(eventPath)
console.log('event:', JSON.stringify(event, null, 2))

Promise.all([
  execa('git', ['rev-parse', '--short', 'HEAD']).then(res => res.stdout),
  execa('git', ['symbolic-ref', '--short', 'HEAD']).then(res => res.stdout),
  event.repository.owner.name,
  event.repository.name
])
.catch(error => {
  console.error(error)
  process.exitCode = 1
})
.then(([ref, branch, owner, repo]) => {
  console.log('!', {ref, branch, owner, repo})
})
