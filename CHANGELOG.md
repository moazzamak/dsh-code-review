# Changelog

All notable changes to this pack are listed here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Precedence over dsh's built-in changed-files card.** With the pack installed,
  the card dsh draws under each completed turn no longer appears, so `/review`
  is the way into a turn's changes rather than one of two. The pack contributes
  a `conversation.chat.turnTail` chain entry at `priority: -1` — below the
  built-in entry's default `0`, so the election does not depend on plugin load
  order — whose selector claims the turns the built-in card would claim and
  whose component renders nothing. A turn that declared files with the `present`
  tool is left to the built-in entry, because the card and the declared-file
  rows are drawn by one component and this pack has no substitute for the rows.
- `TURN_TAIL_SLOT` in `src/protocol.ts`, pinned by `tests/protocol.spec.ts`
  together with the election order, and `src/client/turn-tail.ts` holding the
  selector, the empty component, and the contribution.

### Changed

- The browser half declares `slots` among its required services. A Host without
  the slot renderer keeps `/review` and the Skill and gets no suppression, rather
  than the pack failing to load.

## [0.2.0] — 2026-10-04

Ported to the review surface dsh 0.2 ships. **Breaking**: `/review` no longer
opens the pinned Changes page, because dsh 0.2 removed it along with per-chunk
Keep/Reject, the working-tree revert, and the rejection note that reached the
model. Nothing on the 0.2 side reverts a change behind the agent's back.

### Changed

- **`/review`** now opens the newest recorded turn's **changed files** in the
  right sidebar, each with its side-by-side or unified comparison. That view is
  the `changes-review` tab type owned by `@deepseek-ai/dsh-client-ui-deliverables`.
- The command is offered only while all three of its preconditions hold: the
  comparison view is registered, the Session's right column is mounted, and the
  Session holds a turn whose changes the recorder announced. `isMounted()`, which
  dsh 0.2 removed from the right-sidebar service, is replaced by the
  mounted-Session snapshot.
- The `dsh-change-review` Skill was rewritten for the 0.2 record: the turn, not
  the tool call, is the unit the User reviews; only top-level turns are recorded,
  so a subagent's edits never reach the diff; comparisons live only while the
  Session lives; and nothing is reverted, so a comment on a change means the
  change is still in the file. It no longer teaches a rejection contract that
  0.2 cannot honour.
- The pack finds the turn's coordinates by reading the Session's own loaded event
  window (`ctx.sessions.binding(sessionId).eventSource`) instead of importing the
  changed-files constant. `dsh.client.external` is therefore empty, and the built
  browser bundle has no dependency on any other dsh package — the whole
  cross-package surface is restated in `src/protocol.ts` and pinned by tests.

### Added

- `src/protocol.ts` — the one module that restates the surface this pack does not
  own (the tab kind, the `workspace/changes` event, and the
  `dsh-resource://changes-review/session/<sessionId>/<seq>/<turn>` address), with
  `tests/protocol.spec.ts` asserting each restated fact so an upstream rename
  fails loudly instead of turning `/review` into a silent no-op.
- Tests for the event-window scan, the three availability preconditions, the
  address encoding, and the refusal of an announcement whose payload names no
  turn.

### Removed

- The dependency on `@deepseek-ai/dsh-client-ui-sidebar-documentpreview` and its
  `CHANGES_KIND`, which dsh 0.2 deleted.

### Notes

- 0.1.x remains the release for a dsh 0.1.5 build, where the Changes page and
  keep/reject still exist. The README's compatibility table states which pack
  drives which dsh.

## [0.1.3] — 2026-09-30

Documentation only; `lib/` is byte-identical to 0.1.0 and the composition is
unchanged.

### Added

- The READMEs now cover the **desktop app**: the review page is part of the
  desktop build, the keyboard shortcuts it carries for the same actions, and how
  to install this pack there. The app's Desktop Plugins window accepts npm
  registry specs only (`name`, `name@version`, `name@tag`) and refuses `github:`
  and `file:` specs, so the Git install documented for the web profile does not
  apply to it — the pack has to be published to npm first.

## [0.1.2] — 2026-09-30

Documentation only; `lib/` is byte-identical to 0.1.0 and the composition is
unchanged.

### Changed

- Both READMEs are now written for people using the pack rather than for whoever
  maintains it: install and removal, what appears after installing, a
  step-by-step walkthrough of reviewing, keeping, and rejecting a change, what
  the agent is told about a rejection, and the dsh build the pack needs.
- Maintainer material moved out of the README into [DEVELOPMENT.md](DEVELOPMENT.md):
  the repository layout, and the one identity shared by the package name, the
  composition row, and the browser bundle id.

## [0.1.1] — 2026-09-30

Documentation only; `lib/` is byte-identical to 0.1.0 and the composition is
unchanged.

### Changed

- The README now states that this is an **unofficial community pack**, not
  affiliated with, endorsed by, or published by DeepSeek, and points dsh issues
  upstream.
- The README now records that the name is not unique on npm — `dsh-code-review`,
  `@moazzamak/dsh-code-review`, `@moazzamak/dsh-code-review`, and
  `@moazzamak/dsh-code-review` are unrelated packages — and that this pack is
  `@moazzamak/dsh-code-review`, published from this repository only.

## [0.1.0] — 2026-09-30

Initial release.

### Added

- **`/review`** — a Client command that reveals dsh's pinned **Changes** page,
  offered exactly while the right sidebar that owns the page is mounted. It
  opens the page by the kind the registering package exports
  (`CHANGES_KIND`), never by a repeated string literal.
- **The `dsh-change-review` Skill** — registered on the Host as a runtime Skill
  through `ctx.effect()`, so unloading the row or an HMR reload removes it. It
  states the contract a tool result cannot carry: a rejected chunk has already
  been reverted from the file, the rejection is projected back into the model's
  context as a note naming the path and the text it removed, and one tool call
  is one reviewable chunk. A Host without a Skill registry gets no contribution
  instead of a failed row.
- **One composition layer** (`cordis.patch.yml`) inserting the pack's single
  plugin row, with the browser half discovered from the package's `dsh.client`
  declaration.
- Bilingual documentation (`README.md`, `README.zh.md`) and the pack's own two
  specs.

### Notes

- The pack does not implement the review surface. The diff, the per-chunk
  **Keep** / **Reject** controls, the pending-file list, the revert endpoint, and
  the model-facing rejection note belong to DeepSeek Harness; the pack adds the
  shortcut and the instructions that make the loop cheap to use.
- Requires a dsh build that ships that surface — see
  [Requirements](README.md#requirements).

[Unreleased]: https://github.com/moazzamak/dsh-code-review/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/moazzamak/dsh-code-review/releases/tag/v0.2.0
[0.1.3]: https://github.com/moazzamak/dsh-code-review/releases/tag/v0.1.3
[0.1.2]: https://github.com/moazzamak/dsh-code-review/releases/tag/v0.1.2
[0.1.1]: https://github.com/moazzamak/dsh-code-review/releases/tag/v0.1.1
[0.1.0]: https://github.com/moazzamak/dsh-code-review/releases/tag/v0.1.0
