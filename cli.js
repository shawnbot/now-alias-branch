#!/usr/bin/env node
const execa = require('execa')
const event = require(process.env.GITHUB_EVENT_PATH)
console.log('event:', JSON.stringify(event, null, 2))

Promise.all([
  execa('git', ['rev-parse', '--short', 'HEAD']).then(res => res.stdout),
  execa('git', ['symbolic-ref', '--short', 'HEAD']).then(res => res.stdout),
  event.repository.split('/', 1)
])
.catch(error => {
  console.error(error)
  process.exitCode = 1
})
.then(([ref, branch, [owner, repo]]) => {
  console.log('gotcha:', {ref, branch, owner, repo})
})
