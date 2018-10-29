FROM node:10-slim

LABEL com.github.actions.name="Now branch preview"
LABEL com.github.actions.description="Aliases the existing Now deployment for this commit to a URL with the branch name in it."
LABEL com.github.actions.icon="eye"
LABEL com.github.actions.color="black"

COPY . "/now-branch-preview"
WORKDIR "/github/workspace"
CMD npm install "/now-branch-preview"
ENTRYPOINT ["npx", "now-branch-preview"]
