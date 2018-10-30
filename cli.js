#!/usr/bin/env node
const execa = require('execa')
const eventPath = process.env.GITHUB_EVENT_PATH || require.resolve('./event.json')
const event = require(eventPath)
console.log('event:', JSON.stringify(event, null, 2))

Promise.all([
  execa('git', ['rev-parse', '--short', 'HEAD']).then(res => res.stdout),
  execa('git', ['symbolic-ref', '--short', 'HEAD']).then(res => res.stdout),
])
.catch(error => {
  console.error(error)
  process.exitCode = 1
})
.then(results => {
  const [ref, branch] = results
  const owner = event.repository.owner.name
  const repo = event.repository.name
  console.log('!', {ref, branch, owner, repo})
})
