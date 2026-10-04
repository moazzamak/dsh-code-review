//#region lib/types/skill.js
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
const CODE_REVIEW_SKILL_NAME = "dsh-change-review";
/** One-line routing description shown in the model's Skill catalog. */
const CODE_REVIEW_SKILL_DESCRIPTION = "Work with the User's review of your changes: how each turn's diff is recorded, what that record leaves out, and how to keep a turn cheap to review";
/**
* The Skill instructions.
*
* Written for the model, in the imperative, and deliberately short: it is
* loaded on demand and must not restate the tool schemas it refers to.
*/
const CODE_REVIEW_SKILL = `# Working with the User's review of your changes

DeepSeek Harness records what each top-level turn changed. It snapshots the
working tree through git at the turn's start and again at its end, and copies
any file whole before a file tool edits it, so it can also account for the files
git does not cover. The User reads one file's comparison — side by side or
unified, with the changed hunks drawn where they happened — in the right
sidebar. \`/review\` opens the newest turn's comparison.

**This build has no keep/reject step.** Nothing is reverted behind your back,
no rejection is reported back to you, and nothing about your work reaches you
except the User's own words. A comment on a change means the change is still in
the file and the User has read it: edit exactly what they asked, leave what they
accepted alone, and do not re-open a decision they already made.

## What the record covers, and what it leaves out

- **Only top-level turns are recorded.** A subagent's edits are never part of
  the User's per-turn diff, so when you delegate, your own message has to carry
  what the subagent changed.
- A path whose content is unchanged at the turn's end is not listed at all.
- A nested repository or submodule appears as a single entry; its internals do
  not.
- In a working directory with no git repository, only file-tool edits are
  listed, and shell edits are absent from the record entirely.
- Summaries and comparisons live on the Host only while the Session lives. A
  Session reopened after a Host restart has no comparison for its earlier turns.
- The record starts at the turn. If the working directory already held
  uncommitted edits when the turn began, they are not attributed to you.

## Write turns that are cheap to review

The turn is the unit the User reviews, not the tool call, so:

- **One coherent change per turn.** Two unrelated edits in one turn arrive as
  one comparison the User has to hold in their head at once. Land the first,
  let them read it, then start the second.
- Keep the diff minimal: no unrelated reformatting, no whole-file rewrite where
  an edit will do, no incidental changes the User did not ask for.
- **Say what changed and why in your own message.** The comparison is on
  demand, so assume the User has not opened it; and a subagent's work is never
  in it. A short account of each file you touched is what makes the turn
  reviewable at all.
`;
//#endregion
//#region lib/types/index.js
/**
* Node half of the code-review pack.
*
* The half that the model can see is a Skill: `dsh-change-review` states what
* each turn's recorded diff covers and how to keep a turn cheap to review. It
* is registered as a runtime Skill, so it lives exactly as long as this row
* does and needs no project directory or user configuration.
*
* The browser half (`./client`) adds `/review`; the recording, the per-file
* comparison, and the turn-tail card belong to dsh.
* @module @deepseek-ai/dsh-code-review
*/
/** Stable Cordis plugin name. */
const name = "code-review-pack";
/**
* Plugin body: contribute the review workflow as a runtime Skill.
*
* A Host without the Skill registry (a face that never loads skills) simply
* gets no contribution rather than a failed row, which is the same posture the
* review surface itself takes toward a missing prompt service.
* @param ctx - host context carrying the Skill registry.
*/
function apply(ctx) {
	const skills = ctx.get("skills");
	if (skills === void 0) return;
	ctx.effect(() => skills.register({
		name: CODE_REVIEW_SKILL_NAME,
		description: CODE_REVIEW_SKILL_DESCRIPTION,
		source: "runtime",
		content: CODE_REVIEW_SKILL
	}), "code-review-pack: change-review skill");
}
//#endregion
export { apply, name };
