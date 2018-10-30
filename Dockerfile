FROM node:10-slim

LABEL com.github.actions.name="Now branch preview"
LABEL com.github.actions.description="Aliases the existing Now deployment for this commit to a URL with the branch name in it."
LABEL com.github.actions.icon="eye"
LABEL com.github.actions.color="black"

COPY . "/now-branch-preview"
WORKDIR "/github/workspace"
ENTRYPOINT ["npx", "-p", "/now-branch-preview", "now-branch-preview"]
