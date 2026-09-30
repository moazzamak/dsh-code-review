//#region lib/types/skill.js
/**
* The pack's Skill body.
*
* The review surface itself is DSH's; what an agent is missing without this
* text is the *contract* around it — that a rejected chunk is already gone from
* the file, that a rejection comes back as a note naming what was removed, and
* that one tool call is one reviewable chunk. The body is a plain constant so
* the registered Skill needs no filesystem of its own.
* @module @deepseek-ai/dsh-code-review/skill
*/
/** Kebab-case name the registered Skill answers to. */
const CODE_REVIEW_SKILL_NAME = "dsh-change-review";
/** One-line routing description shown in the model's Skill catalog. */
const CODE_REVIEW_SKILL_DESCRIPTION = "Work with the User's keep/reject decisions over your file changes: what a rejection means, and how to write changes that are cheap to review";
/**
* The Skill instructions.
*
* Written for the model, in the imperative, and deliberately short: it is
* loaded on demand and must not restate the tool schemas it refers to.
*/
const CODE_REVIEW_SKILL = `# Reviewing your changes with the User

Every file mutation in a Session lands in the User's review queue. The pinned
**Changes** page in the right Sidebar lists each changed file with its added and
removed line counts; opening a file shows its diff, where each changed chunk
carries a \`Keep\` / \`Reject\` control. The User can also keep or reject a whole
file, or the whole list at once. A chunk is the smallest unit \`git add -i\`
would offer if you split to the end: one maximal run of changed lines.

The Session header's change count is the standing way back to that page, and
\`/review\` opens it.

## A rejection is already done

Rejecting a chunk reverts it in the working tree and records the decision on the
Session. That record is projected back into your context as a note listing each
rejected chunk by path and the text it added. Therefore:

- After a rejection note appears, the code is gone. Re-read the file before
  building on it; never assume your edit is still there.
- Do not re-apply a rejected change, and do not re-introduce it in another form,
  unless the User asks for it.
- If a rejection removed something you still believe is required, say so in your
  next message and let the User decide. Do not silently work around it.

## Write changes that are cheap to review

- One logical change per tool call. Two unrelated edits in one call become one
  chunk that can only be kept or rejected as a unit.
- Keep the diff minimal: no unrelated reformatting, no whole-file rewrite where
  an edit will do.
- Describe what changed in the message that follows the call, so the User can
  decide each chunk without re-deriving your intent.

## When the User keeps everything

Silence means no outstanding rejection. Carry on; the accepted changes are in
the files and need no acknowledgement.
`;
//#endregion
//#region lib/types/index.js
/**
* Node half of the code-review pack.
*
* The pack exists to make DSH's built-in review loop cheap to use, and the half
* that the model can see is a Skill: `dsh-change-review` states what a rejected
* chunk means and how to write changes the User can decide one at a time. It is
* registered as a runtime Skill, so it lives exactly as long as this row does
* and needs no project directory or user configuration.
*
* The browser half (`./client`) adds `/review`; the diff, the decisions, the
* pending list, and the rejection note itself belong to DSH.
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
