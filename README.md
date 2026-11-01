# @moazzamak/dsh-code-review

A code-review pack for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (`dsh`). It adds a `/review` command that opens the newest turn's changed files, compared one by one, and a Skill that tells the agent what that record covers and how to keep a turn cheap to review.

> **Unofficial community pack.** Not affiliated with, endorsed by, or published by DeepSeek. See [Naming and affiliation](#naming-and-affiliation).

English | [中文](README.zh.md)

## Which dsh this drives

DeepSeek Harness replaced its review surface in the 0.2 line, and this pack follows it.

| Pack | dsh | What `/review` opens |
| --- | --- | --- |
| 0.2.x | 0.2 and later | The selected turn's **changed files**, each with a side-by-side or unified comparison. There is no keep/reject step. |
| 0.1.x | 0.1.5 | The pinned **Changes** page, with per-chunk Keep/Reject that reverted a rejected chunk in the working tree. |

dsh 0.2 removed the keep/reject surface entirely: nothing reverts a change behind the agent's back any more, no rejection is reported back to the model, and the diff record is read-only. The 0.2 Skill says so, because an agent told to expect a rejection note would wait for one that never arrives. Use 0.1.x only on a dsh 0.1.5 build.

## Install

```sh
dsh plugin --profile web add github:moazzamak/dsh-code-review
```

Restart `dsh` (or reload the page) afterwards. To remove it again:

```sh
dsh plugin --profile web remove @moazzamak/dsh-code-review
```

Once installed, three things appear: a **Plugins** entry in Settings, `/review` in the input, and `dsh-change-review` in the agent's Skill list.

### Desktop app

The Electron desktop build runs the same dsh surfaces, so the comparison view is there without any plugin. Adding *this pack* to a packaged desktop app is a separate step: the app's **Desktop Plugins** window installs plugins into its own profile with its bundled pnpm, and it accepts npm registry specs only. Add the bundle to that profile's `dsh.profile.bundles` list, or install it from a local checkout.

## What you get

- **`/review`** — opens the newest recorded turn's changed files in the right sidebar. Each row is one file; opening it shows that file's turn-start and turn-end contents as hunks, side by side or unified, with line wrapping. `/review` appears only while all three of these hold: the comparison view is registered, the Session's right column is mounted, and the Session has a turn whose changes were recorded. A command whose page has nowhere to open is worse than an absent command, so the pack hides it rather than offering a no-op.
- **The `dsh-change-review` Skill** — what the agent cannot learn from a tool result: that a turn, not a tool call, is the unit you review; that only top-level turns are recorded, so a subagent's edits are never in your diff; that a Session reopened after a Host restart has no comparison for its earlier turns; and that nothing is reverted, so a comment on a change means the change is still in the file.
- **Precedence over the built-in diff card** — while the pack is installed, dsh's own changed-files card no longer appears under each turn, so `/review` is the way into a turn's changes rather than one of two. See [Precedence](#precedence) for the one case the pack leaves alone.

The recording, the comparison, and the turn-tail card are part of dsh itself. This pack adds the shortcut, the instructions, and the precedence, nothing else.

## Precedence

`/review` opens dsh's own per-file comparison; it is the built-in diff view, reached by shortcut. So "the pack takes precedence" cannot mean a different viewer — it means dsh stops offering its **second** way in. That second way is the changed-files card dsh draws under each completed turn, whose header opens the same comparison.

While the pack is installed, that card is suppressed: the transcript goes back to prose plus tool rows, and the diff surface lives in the right sidebar, where `/review` puts it.

Two limits are deliberate.

- **A turn that declared files with the `present` tool keeps the built-in card.** The card and the declared-file rows are drawn by one component, and this pack has no substitute for the rows, so suppressing the card there would delete the rows with it. The pack claims a turn only while the card is the only thing that component would draw.
- **Precedence is the pack's, not a preference.** There is nothing to switch on and no setting it reads or changes; removing the pack restores the card.

The pack does not read or change **Show coding view** (`developerTools`) — the setting described under [The turn-tail card](#the-turn-tail-card) — and turning that setting off still removes the card the ordinary way, whether or not this pack is installed.

## Reviewing changes

1. Run `/review`.
2. The sidebar lists the newest turn's changed files, each with its added and removed line counts.
3. Pick a file. Its comparison opens on the first changed file of the turn; **split**/**unified** and **line wrap** are controls on the view.
4. A file whose contents are unchanged at the turn's end is not listed at all, and a file larger than the recorder's limit is listed without a comparison.

### The turn-tail card

By default dsh also draws a changed-files card under each turn in the conversation, and each card carries a **Review this turn's changes in the sidebar** action. Both are gated by one setting, **Show coding view** (`developerTools`), which also controls the Trajectory view and the full Agent preset picker.

Installing this pack suppresses the card without touching that setting — see [Precedence](#precedence). Turning the setting off still works the ordinary way and removes the card whether or not the pack is installed.

## Requirements

The pack drives dsh's own review surface, so it needs a dsh build that includes it:

| What it uses | Package |
| --- | --- |
| The comparison view and the `changes-review` tab kind | `@deepseek-ai/dsh-client-ui-deliverables` |
| The closing-turn chain the built-in diff card is contributed to | `@deepseek-ai/dsh-client-ui-chat` |
| The slot renderer the suppression contributes through | `@deepseek-ai/dsh-client-ui-renderer` |
| `openResource`, and the mounted-Session snapshot | `@deepseek-ai/dsh-client-ui-sidebar-right` |
| The Session's loaded event window (`sessions.binding`) | `@deepseek-ai/dsh-api-session-controller` |
| The `workspace/changes` event that names each recorded turn | `@deepseek-ai/dsh-workspace-changes` |
| A Skill registry | `@deepseek-ai/dsh-skill` |

The tab kind, the chain key, the event, and the address format it opens are private to those packages, so this pack restates them in one module (`src/protocol.ts`) and pins each restated fact with a test. A dsh build that renames the kind, the chain, the event, or the address fails that test rather than silently breaking `/review` — or silently losing the precedence, which would put the card back without anyone noticing.

Every dsh package is declared as an optional peer, so installing the pack never pulls a second copy of dsh.

## Naming and affiliation

Unofficial and community-built: not affiliated with, endorsed by, or published by DeepSeek. The review surface this pack drives is DeepSeek Harness's own code, MIT-licensed like this pack, and lives at [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) — problems with dsh itself belong there.

Similar names exist on npm. These are unrelated packages by other authors: `dsh-code-review` (a read-only review agent preset), `@moazzamak/dsh-code-review`, `@moazzamak/dsh-code-review` (change summaries, a review tab, and guarded undo), and `@moazzamak/dsh-code-review` (a two-column git-diff page). This pack is **`@moazzamak/dsh-code-review`**, published only from [this repository](https://github.com/moazzamak/dsh-code-review).

## Links

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) — the harness this pack plugs into
- [CHANGELOG.md](CHANGELOG.md) — what changed in each release
- [DEVELOPMENT.md](DEVELOPMENT.md) — how this repository is built and released

## License

[MIT](LICENSE) © Moazzam Abdullah Khan. DeepSeek Harness is MIT too.
