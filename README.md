# now-alias-branch
A GitHub Action to alias your Now deployments to a branch-specific name. It runs `now` with the provided args in your repo directory, then aliases 

## Usage
This action should replace [actions/zeit-now](/actions/zeit-now) in your workflow(s): 

```hcl
action "deploy" {
  uses = ["shawnbot/now-alias-branch@v0.0.1"]
  env = {
    NOW_ALIAS_URL = "{app}-{branch}.now.sh",
  }
}
```

### `NOW_ALIAS_URL`
The `NOW_ALIAS_URL` environment variable tells the action where to alias the default deployment. Its value can be any Now-acceptable hostname (`foo-bar` is the same as `foo-bar.now.sh`, for instance) or — and here's 99% of the value this action provides — you can use the following placeholders to have the deployment URLs vary automatically:

* `{name}` is your app's name as pulled from the `name` field of either `now.json` or `package.json`. If neither of those files exists or has a `name` field, we use the name of the repo.
* `{branch}` is the branch on which the workflow is running, as extracted from the ref `refs/heads/{branch}`.
* `{sha}` is the 7-character commit SHA.

Each value is normalized to replace any sequence of one or more characters that aren't a letter, number, underscore, or hyphen with a single hyphen (`-`).
