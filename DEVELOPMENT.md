# Development

## Where this repository stands

Until dsh 0.1.5 this pack **mirrored** `packages/bundle/code-review` of the
[`deepseek-harness`](https://github.com/deepseek-ai/deepseek-harness) monorepo:
`src/`, `tests/`, `tsconfig*.json`, and `cordis.patch.yml` were the same files
with only the package name and the documentation adapted.

dsh 0.2 removed that bundle, along with the review surface it drove, so there is
nothing left to mirror: this repository is now the pack's own source of truth.
It is still *built* inside a checkout, because the client-bundle build preset
lives there and is not published as a package.

Two consequences worth knowing before you edit anything:

1. **`lib/` is committed on purpose.** A dsh bundle is installed exactly as the
   package is, and `dsh plugin add <git-url>` does not build anything, so the
   built `lib/index.js` (Host half) and `lib/client.js` (browser half) ship in
   the repository. Edit `src/`, rebuild, and commit both.
2. **Building needs the monorepo, and the package has to be inside it.** The
   preset at `packages/client/tsdown.client.ts` locates a package by globbing the
   checkout's `packages/*/*/package.json` for the bundle id, and computes its
   repository root from its own location — so pointing `DSH_CHECKOUT` at a
   checkout is not enough on its own; the repository has to be present in that
   checkout's tree at `packages/<group>/<dir>` (any group). The `tsconfig*.json`
   here also reference the monorepo's project graph, three levels up.

## Repository layout

| Path | Role |
| --- | --- |
| `package.json` | `dsh.bundle.patch` plus the `dsh.client` browser-half declaration |
| `cordis.patch.yml` | the single composition layer: insert the pack's row |
| `src/index.ts`, `src/skill.ts` | Host half — the `dsh-change-review` runtime Skill |
| `src/client/index.ts`, `src/client/locales.ts` | browser half — `/review` and its copy (zh source of truth + en) |
| `src/protocol.ts` | the restated dsh surface: the tab kind, the `workspace/changes` event, and the review address |
| `lib/` | built artifacts, committed (see above) |
| `tests/` | the three specs, run from the checkout |

`src/protocol.ts` exists because the pack depends on a chain of dsh packages
whose kind, event type, address scheme, and builder are all private. Everything
restated there is pinned by `tests/protocol.spec.ts`; when a dsh release moves
one of those seams, that test fails first.

## One identity, four places

Four places spell the package identity, and they have to agree:

1. `name` in `package.json` — what the profile installs and lists.
2. the row's `name` in `cordis.patch.yml` — what the composition resolves.
3. the first argument of `clientBundle(...)` in `tsdown.config.ts` — the id the
   browser module loader registers the built `lib/client.js` under.
4. the checkout copy's `name` in `package.json` — the preset matches the id
   against the manifests it globs, so a build workspace spelled differently fails
   with "no packages/\*/\*/package.json declares the name …".

A composition matches a row to its browser half by that id, so a mismatch mounts
the Host half and nothing else: the Skill registers, `/review` never appears.
Rename all four together.

## Rebuild

Verified recipe. `<checkout>` is a `deepseek-harness` checkout with its
dependencies installed; `<repo>` is this repository.

```sh
# 1. Put the package in the checkout under its published name.
cp -r <repo>/src <repo>/tests <repo>/package.json \
      <repo>/tsconfig.host.json <repo>/tsconfig.client.json <repo>/cordis.patch.yml \
      <checkout>/packages/bundle/code-review/

# 2. Emit lib/types/** for both halves (the browser bundle consumes the client half).
cd <checkout>
./node_modules/.bin/tsc -b packages/bundle/code-review/tsconfig.host.json
./node_modules/.bin/tsc -b packages/bundle/code-review/tsconfig.client.json

# 3. Build the Host bundle and the browser closure factory.
cd packages/bundle/code-review
../../node_modules/.bin/tsdown

# 4. Copy lib/ back into <repo> and commit it, minus *.tsbuildinfo.
```

Two notes on step 2. `tsconfig.client.json` references
`packages/api/session-controller/tsconfig.client.json`, not that package's
directory: its `tsconfig.json` is a solution file and is not `composite`, which
`tsc -b` refuses to reference. And the client project is what emits the shipped
`.d.ts` surface; `tsdown` alone would build the bundles and leave `lib/types`
stale.

## Tests

The specs run where their imports and path aliases resolve — inside the checkout,
with the package present as above:

```sh
cd <checkout>
./node_modules/.bin/vitest run packages/bundle/code-review/tests
```

- `tests/skill.spec.ts` — the Host half registers the Skill, the fiber releases
  it, a Host without a Skill registry gets no contribution, and the Skill body
  teaches the 0.2 record rather than the keep/reject contract 0.2 removed.
- `tests/review-command.client.spec.ts` — `/review` is registered; it is offered
  only while the comparison view is registered, the Session's column is mounted,
  and the Session holds an announced turn; it opens the address built from the
  newest announcement; and it reports a refused navigation instead of throwing.
- `tests/protocol.spec.ts` — the restated kind, event type, address scheme, and
  the coordinate bounds the comparison view's own parser applies.

They are written for this repository, not mirrored from anywhere.

## Release checklist

1. Bump `version` in `package.json`.
2. Rebuild `lib/` (above) and commit it in the same change.
3. Add a `CHANGELOG.md` entry.
4. Commit, then tag `v<version>` (annotated) and push the tag.

The requirement the pack stands on — a dsh build that ships the recorder and the
comparison view — is recorded in [README.md](README.md#requirements), and the
table mapping pack versions to dsh versions is in
[README.md](README.md#which-dsh-this-drives). Keep both current when the seams
move.
