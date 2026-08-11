# npm publish setup

repomark uses **npm trusted publishing** (OIDC) from GitHub Actions.

## One-time setup

1. Sign in at [npmjs.com](https://www.npmjs.com/) as the package owner
2. After the first publish, open https://www.npmjs.com/package/@topdaily-dev/repomark/access
3. Under **Trusted publishing**, add GitHub Actions:
   - **Organization or user:** `topdaily-dev`
   - **Repository:** `repomark`
   - **Workflow filename:** `publish-npm.yml`
   - **Allowed actions:** `npm publish`

## First publish (local)

```bash
npm login
cd repomark
npm publish --access public
```

## Later releases

Create a GitHub release (`vX.Y.Z`) matching `package.json`, or:

```bash
gh workflow run publish-npm.yml -R topdaily-dev/repomark
```
