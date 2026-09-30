# @moazzamak/dsh-code-review

A code-review pack for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`). It adds a `/review` command that brings up dsh's **Changes** page, and a Skill that tells the agent how to behave around the changes you keep or reject.

> **Unofficial community pack.** Not affiliated with, endorsed by, or published by DeepSeek. See [Naming and affiliation](#naming-and-affiliation).

English | [中文](README.zh.md)

## Install

```sh
dsh plugin --profile web add github:moazzamak/dsh-code-review
```

Restart `dsh` (or reload the page) afterwards. To remove it again:

```sh
dsh plugin --profile web remove @moazzamak/dsh-code-review
```

Once installed, three things appear: a **Plugins** entry in Settings, `/review` in the input, and `dsh-change-review` in the agent's Skill list.

## What you get

- **`/review`** — opens the pinned **Changes** page in the right sidebar: every file the agent changed that still has a change you have not decided. The change count in the Session header opens the same page.
- **The `dsh-change-review` Skill** — how the agent learns to work with your decisions. It is told that a change you rejected has already been taken out of the file, that the rejection is reported back to it with the file path and the text that was removed, and that one tool call should carry one logical change so each change stays easy to judge on its own.

The diff, the **Keep** / **Reject** buttons, the pending list, and the note the agent receives are part of dsh itself. This pack adds the shortcut and the instructions, nothing else.

## Reviewing changes

1. Run `/review`, or click the change count in the Session header.
2. The **Changes** page lists every changed file with its added and removed line counts and how many changes are still undecided. Pick a row to open the file; the preview lands on its first undecided change.
3. In the file, each changed chunk is drawn where it happened with **Keep** and **Reject** beside it. A *chunk* is the smallest unit `git add -i` would split out: one run of changed lines.
4. **Keep** records the decision and leaves the file alone. **Reject** takes that one chunk back out of the file, then records it. Other chunks in the same file are untouched.
5. Whole-file and whole-list shortcuts sit on the page too: each row carries **Keep** / **Reject** for its file, and the bar under the list carries **Keep all** / **Reject all**.
6. A file that changed after you opened it is refused instead of reverted — **Reject** checks the file's version first, so it cannot undo edits you never saw.

Rejections are reported to the agent. dsh adds a context entry naming the changed files and the text that was removed, so the agent stops assuming its edit is still in the file and does not put it back. The entry costs nothing while nothing is rejected.

## Requirements

The pack drives dsh's own review surface, so it needs a dsh build that includes it:

| What it uses | Package |
| --- | --- |
| The Changes page, the per-chunk diff rows, and the `changes` page kind | `@deepseek-ai/dsh-client-ui-sidebar-documentpreview` |
| `isMounted()` on the right-sidebar service | `@deepseek-ai/dsh-client-ui-sidebar-right` |
| The record of applied changes and review decisions | `@deepseek-ai/dsh-api-workspace-files` |
| A Skill registry | `@deepseek-ai/dsh-skill` |

At the time of this release those are not in a published dsh build yet. On a build that predates them the plugin still loads — the Skill is registered and `/review` appears — but there is no page for the command to open. Every dsh package is declared as an optional peer, so installing the pack never pulls a second copy of dsh.

## Naming and affiliation

Unofficial and community-built: not affiliated with, endorsed by, or published by DeepSeek. The review surface this pack drives is DeepSeek Harness's own code, MIT-licensed like this pack, and lives at [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) — problems with dsh itself belong there.

Similar names exist on npm. These are unrelated packages by other authors: `dsh-code-review` (a read-only review agent preset), `@michengai/dsh-code-review`, `@dsh-plugin/dsh-code-review` (change summaries, a review tab, and guarded undo), and `@yangzhe1991/dsh-code-review` (a two-column git-diff page). This pack is **`@moazzamak/dsh-code-review`**, published only from [this repository](https://github.com/moazzamak/dsh-code-review).

## Links

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) — the harness this pack plugs into
- [CHANGELOG.md](CHANGELOG.md) — what changed in each release
- [DEVELOPMENT.md](DEVELOPMENT.md) — how this repository is built and released

## License

[MIT](LICENSE) © Moazzam Abdullah Khan. DeepSeek Harness is MIT too.
