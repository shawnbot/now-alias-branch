module.exports = function getEventData(event) {
  const {repository} = event
  const branch = event.ref.split('/').slice(2).join('/')
  const owner = repository.owner.name
  const repo = repository.name
  return {
    sha: event.after,
    branch,
    owner,
    repo
  }
}
