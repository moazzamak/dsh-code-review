# Changelog

All notable changes to this pack are listed here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/moazzamak/dsh-code-review/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/moazzamak/dsh-code-review/releases/tag/v0.1.0
