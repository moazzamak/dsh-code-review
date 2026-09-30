# Changelog

All notable changes to this pack are listed here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
  `@michengai/dsh-code-review`, `@dsh-plugin/dsh-code-review`, and
  `@yangzhe1991/dsh-code-review` are unrelated packages — and that this pack is
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

[Unreleased]: https://github.com/moazzamak/dsh-code-review/compare/v0.1.3...HEAD
[0.1.3]: https://github.com/moazzamak/dsh-code-review/releases/tag/v0.1.3
[0.1.2]: https://github.com/moazzamak/dsh-code-review/releases/tag/v0.1.2
[0.1.1]: https://github.com/moazzamak/dsh-code-review/releases/tag/v0.1.1
[0.1.0]: https://github.com/moazzamak/dsh-code-review/releases/tag/v0.1.0
