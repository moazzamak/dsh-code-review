/**
 * The pack's Skill body.
 *
 * What an agent cannot learn from a tool result is the *contract* around the
 * review surface: that this build records each top-level turn's diff and shows
 * it on demand, that nothing is reverted behind the agent's back, that a
 * subagent's edits are absent from that record, and that the reviewable unit is
 * the turn rather than the tool call. The body is a plain constant so the
 * registered Skill needs no filesystem of its own.
 * @module @deepseek-ai/dsh-code-review/skill
 */
/** Kebab-case name the registered Skill answers to. */
export declare const CODE_REVIEW_SKILL_NAME = "dsh-change-review";
/** One-line routing description shown in the model's Skill catalog. */
export declare const CODE_REVIEW_SKILL_DESCRIPTION = "Work with the User's review of your changes: how each turn's diff is recorded, what that record leaves out, and how to keep a turn cheap to review";
/**
 * The Skill instructions.
 *
 * Written for the model, in the imperative, and deliberately short: it is
 * loaded on demand and must not restate the tool schemas it refers to.
 */
export declare const CODE_REVIEW_SKILL = "# Working with the User's review of your changes\n\nDeepSeek Harness records what each top-level turn changed. It snapshots the\nworking tree through git at the turn's start and again at its end, and copies\nany file whole before a file tool edits it, so it can also account for the files\ngit does not cover. The User reads one file's comparison \u2014 side by side or\nunified, with the changed hunks drawn where they happened \u2014 in the right\nsidebar. `/review` opens the newest turn's comparison.\n\n**This build has no keep/reject step.** Nothing is reverted behind your back,\nno rejection is reported back to you, and nothing about your work reaches you\nexcept the User's own words. A comment on a change means the change is still in\nthe file and the User has read it: edit exactly what they asked, leave what they\naccepted alone, and do not re-open a decision they already made.\n\n## What the record covers, and what it leaves out\n\n- **Only top-level turns are recorded.** A subagent's edits are never part of\n  the User's per-turn diff, so when you delegate, your own message has to carry\n  what the subagent changed.\n- A path whose content is unchanged at the turn's end is not listed at all.\n- A nested repository or submodule appears as a single entry; its internals do\n  not.\n- In a working directory with no git repository, only file-tool edits are\n  listed, and shell edits are absent from the record entirely.\n- Summaries and comparisons live on the Host only while the Session lives. A\n  Session reopened after a Host restart has no comparison for its earlier turns.\n- The record starts at the turn. If the working directory already held\n  uncommitted edits when the turn began, they are not attributed to you.\n\n## Write turns that are cheap to review\n\nThe turn is the unit the User reviews, not the tool call, so:\n\n- **One coherent change per turn.** Two unrelated edits in one turn arrive as\n  one comparison the User has to hold in their head at once. Land the first,\n  let them read it, then start the second.\n- Keep the diff minimal: no unrelated reformatting, no whole-file rewrite where\n  an edit will do, no incidental changes the User did not ask for.\n- **Say what changed and why in your own message.** The comparison is on\n  demand, so assume the User has not opened it; and a subagent's work is never\n  in it. A short account of each file you touched is what makes the turn\n  reviewable at all.\n";
//# sourceMappingURL=skill.d.ts.map