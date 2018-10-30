const octokit = require('@octokit/rest')
const github = octokit()

if (process.env.GITHUB_TOKEN) {
  github.authenticate({
    type: 'token',
    token: process.env.GITHUB_TOKEN
  })
}

module.exports = github
