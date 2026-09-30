# Development

This repository **mirrors** `packages/bundle/code-review` of the
[`deepseek-harness`](https://github.com/deepseek-ai/deepseek-harness) monorepo:
`src/`, `tests/`, `tsconfig*.json`, and `cordis.patch.yml` are the same files,
with only the package name and the documentation adapted for standalone use.

Two consequences worth knowing before you edit anything:

1. **`lib/` is committed on purpose.** A dsh bundle is installed exactly as the
   package is, and `dsh plugin add <git-url>` does not build anything, so the
   built `lib/index.js` (Host half) and `lib/client.js` (browser half) ship in
   the repository. Edit `src/`, rebuild, and commit both.
2. **Building needs the monorepo.** A dsh Client bundle is not an ordinary
   library build: it must be emitted as a closure factory that registers itself
   with the browser module loader, resolve shared packages through the module
   table, compile CSS modules, and refuse cross-plugin value imports. That
   preset lives at `packages/client/tsdown.client.ts` in the checkout and is not
   published as a package, and the `tsconfig*.json` here reference the
   monorepo's project graph (`vendor/cordis`, `packages/client/*`, …). A
   standalone `tsc -b` therefore cannot resolve its references.

## Repository layout

| Path | Role |
| --- | --- |
| `package.json` | `dsh.bundle.patch` plus the `dsh.client` browser-half declaration |
| `cordis.patch.yml` | the single composition layer: insert the pack's row |
| `src/index.ts`, `src/skill.ts` | Host half — the `dsh-change-review` runtime Skill |
| `src/client/index.ts`, `src/client/locales.ts` | browser half — `/review` and its copy (zh source of truth + en) |
| `lib/` | built artifacts, committed (see above) |
| `tests/` | the two specs, run from the monorepo |

## Composition row name

Three places spell one identity, and they have to agree:

1. `name` in `package.json` — what the profile installs and lists.
2. the row's `name` in `cordis.patch.yml` — what the composition resolves.
3. the first argument of `clientBundle(...)` in `tsdown.config.ts` — the id the
   browser module loader registers the built `lib/client.js` under.

A composition matches a row to its browser half by that id, so a mismatch mounts
the Host half and nothing else: the Skill registers, `/review` never appears.
Rename all three together.

## Rebuild

From a `deepseek-harness` checkout, with this repository either copied in as
`packages/bundle/code-review` or built through its own config:

```sh
# Host half: emits lib/types/** for the entries below
pnpm exec tsc -b packages/bundle/code-review/tsconfig.host.json

# Both faces: the Host bundle and the browser closure factory
DSH_CHECKOUT=/path/to/deepseek-harness pnpm run bundle
```

`tsdown.config.ts` here resolves the preset from `DSH_CHECKOUT` (default:
a sibling `../deepseek-harness` directory). The first argument of
`clientBundle(...)` in that config is the bundle id the browser module loader
registers, and it must equal the package `name` in `package.json` — the
composition row is matched by it, so a mismatch mounts the Host half and no
browser half.

The monorepo build (`pnpm run build:lib:client` from the checkout root) does the
same thing for the mirrored copy; the two artifacts differ only in that id.

## Tests

The two specs run where their imports resolve — inside the monorepo:

```sh
pnpm exec vitest run packages/bundle/code-review/tests
```

- `tests/skill.spec.ts` — the Host half registers the Skill, the fiber releases
  it, and a Host without a Skill registry gets no contribution.
- `tests/review-command.client.spec.ts` — `/review` is registered, offered only
  while the right sidebar is mounted, opens the `changes` kind, and localizes
  through its own namespace.

They are mirrored here verbatim for reading, not adapted to a standalone
install.

## Release checklist

1. Bump `version` in `package.json`.
2. Rebuild `lib/` (above) and commit it in the same change.
3. Add a `CHANGELOG.md` entry.
4. Commit, then tag `v<version>` (annotated) and push the tag.

The requirement the pack stands on — a dsh build that ships the pinned review
surface — is recorded in [README.md](README.md#requirements). Keep that table
current when the seams move.
