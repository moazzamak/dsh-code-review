# @moazzamak/dsh-code-review

A **code-review pack** for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`). It adds the `/review` shortcut that reveals DSH's pinned **Changes** page, and registers the `dsh-change-review` **Skill** that teaches an agent what your **Keep** / **Reject** decisions mean.

> **Unofficial community pack.** Not affiliated with, endorsed by, or published by DeepSeek. See [Naming and affiliation](#naming-and-affiliation).

English | [中文](README.zh.md)

## What it adds

- **`/review`** — a Client command, offered while the right sidebar is mounted, that reveals the pinned **Changes** page: the list of files that still have a change nobody has decided yet. It is the same page the Session header's change count opens.
- **The `dsh-change-review` Skill** — registered on the Host as a runtime Skill, so it appears in the model's Skill catalog while the pack is installed. It states the two rules a tool result cannot carry: a rejected chunk has already been reverted from the file, and a rejection is projected back into the model's context as a note naming the path and the text it removed. It also asks for one logical change per tool call, which is what makes a diff cheap to decide chunk by chunk.

That is the whole pack. The diff, the per-chunk **Keep** / **Reject** controls, the pending-file list, the revert endpoint, and the model-facing rejection note are **DSH's own code**, not this package's — see [Requirements](#requirements) for the build that ships them.

## Install

The pack is a dsh **bundle**: an npm package that ships one composition layer (`cordis.patch.yml`) declaring one plugin row.

```sh
# from this Git repository
dsh plugin --profile web add github:moazzamak/dsh-code-review

# …or from a local checkout of it
dsh plugin --profile web add ./dsh-code-review
```

`dsh plugin add` links the package, appends it to the profile's `dsh.profile.bundles`, and boots the layer after the bundles already listed. Remove it with:

```sh
dsh plugin --profile web remove @moazzamak/dsh-code-review
```

Restart `dsh` (or at least reload the page) after installing or removing. The Settings → Plugins row, the `/review` command, and the Skill catalog entry are the three places the pack becomes visible.

> The row's `name` in [`cordis.patch.yml`](cordis.patch.yml) is the installed package name. If you publish this pack under a different name, change that name to match.

## Requirements

DSH ships the review loop; this pack plugs into it. It therefore needs a dsh build that carries all of:

| Seam | Where it lives |
| --- | --- |
| The pinned **Changes** page and the per-chunk diff rows | `@deepseek-ai/dsh-client-ui-sidebar-documentpreview` (including its exported `CHANGES_KIND` and the `marks` capability on document renderers) |
| `isMounted()` on the right-sidebar service | `@deepseek-ai/dsh-client-ui-sidebar-right` |
| The Host-side ledgers: applied changes, review decisions, and the rejection note | `@deepseek-ai/dsh-api-workspace-files` |
| A Skill registry to register into | `@deepseek-ai/dsh-skill` |

At the time of writing those are in-tree in `deepseek-harness` and **not part of a published dsh release yet**. On a release that predates them the row still mounts, the Skill registers where a Skill registry exists, and `/review` is offered but has no page to open. The pack never carries a second implementation of the review surface: doing so would give you two places to decide the same change.

Every DSH package it names is declared as an **optional** peer, so installing the pack never pulls a second copy of dsh or fails on a version range.

## How the review loop works

What the pack's two contributions point at:

1. **Every applied change is a queue.** DSH folds the Session's whole log into the changes it applied and the decisions taken on them, so the queue survives a reload and covers history the browser never paged in.
2. **A chunk is the smallest unit `git add -i` would offer** if you split to the end: one maximal run of changed lines, aligned between the before and after images.
3. **Keep** records the decision. **Reject** reverses exactly that chunk on disk under the file version you were looking at, then records it — so a file that changed since you looked is refused rather than reverted under a change you never saw.
4. **A rejection reaches the agent.** DSH projects outstanding rejections into the model's context as the runtime-context entry `workspace:change-review`; it renders empty — costing nothing — until something is rejected. That is why the agent stops assuming a change it made is still in the file.
5. **A changed file opens in a renderer that can draw the rows** (the code renderer for a changed `README.md`), and the plain-text fallback draws them too, so a changed `.gitignore` is as decidable as a changed source file. Your own pick in the renderer menu still wins.

## How it works

```
package.json          declares dsh.bundle.patch and the dsh.client browser half
cordis.patch.yml      the one composition layer: insert the pack's row
src/index.ts          Host half — registers the dsh-change-review runtime Skill
src/skill.ts          the Skill body, a plain constant (no filesystem, no config)
src/client/index.ts   browser half — registers /review over the pinned Changes page
src/client/locales.ts the command's copy (zh source of truth + en)
lib/                  built artifacts, committed (see DEVELOPMENT.md)
tests/                the two specs, run from the deepseek-harness checkout
```

The Host half takes no configuration and registers the Skill through `ctx.effect()`, so unloading the row (or an HMR reload) removes it again; a Host without a Skill registry gets no contribution instead of a failed row. The browser half declares the services it binds (`commandUi`, `locale`, `sidebarRight`), offers `/review` exactly while the column that owns the page is mounted, and opens the page by the kind the registering package exports rather than by a repeated string literal.

## Development

See [DEVELOPMENT.md](DEVELOPMENT.md). In short: this repository mirrors `packages/bundle/code-review` of the `deepseek-harness` monorepo verbatim (source and specs), plus the built `lib/` so the pack installs without a build step; rebuilding and running the tests needs that checkout.

## Naming and affiliation

This is an **unofficial, community-built** bundle for DeepSeek Harness. It is not affiliated with, endorsed by, or maintained by DeepSeek, and it is not published by them — the review surface it plugs into is DSH's own code, MIT-licensed like this pack. DeepSeek Harness itself lives at [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness); report dsh problems there or upstream, not here.

The name is **not unique on npm**. Several unrelated packages carry a similar one:

| Package | What it is |
| --- | --- |
| `dsh-code-review` | A read-only code-review **agent preset** (host-only; an agent that reviews code) |
| `@michengai/dsh-code-review` | Codex-style review agents with bilingual reports |
| `@dsh-plugin/dsh-code-review` | Per-turn change summaries, a review tab, and guarded undo |
| `@yangzhe1991/dsh-code-review` | A two-column git-diff review page |

This pack is **`@moazzamak/dsh-code-review`**, published from [this repository](https://github.com/moazzamak/dsh-code-review) only. If you install one of the others, you are installing someone else's plugin — check the package name in `dsh.profile.bundles` or in the composition row before reporting a problem here.

## License

[MIT](LICENSE) © Moazzam Abdullah Khan. The review surface this pack plugs into is DeepSeek Harness, also MIT.
