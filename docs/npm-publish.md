# npm publish setup

repomark uses **npm trusted publishing** (OIDC) from GitHub Actions.

## One-time setup

On [npmjs.com](https://www.npmjs.com/) as **topdaily-dev**:

| Field | Value |
|-------|--------|
| Repository | `topdaily-dev/repomark` |
| Workflow | `publish-npm.yml` |
| Permissions | `npm publish` |

Or via package **Settings → Trusted publishing** after the first publish.

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

## Pair with collab-kit

Bootstrap the full OSS toolchain (including repomark CI) in one step:

```bash
npx @korykaai/collab-kit init . --oss-toolchain
```

See [collab-kit oss-toolchain](https://github.com/kory-kaai/collab-kit/blob/main/examples/oss-toolchain.md).
