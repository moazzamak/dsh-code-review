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
export declare const CODE_REVIEW_SKILL_NAME = "dsh-change-review";
/** One-line routing description shown in the model's Skill catalog. */
export declare const CODE_REVIEW_SKILL_DESCRIPTION = "Work with the User's keep/reject decisions over your file changes: what a rejection means, and how to write changes that are cheap to review";
/**
 * The Skill instructions.
 *
 * Written for the model, in the imperative, and deliberately short: it is
 * loaded on demand and must not restate the tool schemas it refers to.
 */
export declare const CODE_REVIEW_SKILL = "# Reviewing your changes with the User\n\nEvery file mutation in a Session lands in the User's review queue. The pinned\n**Changes** page in the right Sidebar lists each changed file with its added and\nremoved line counts; opening a file shows its diff, where each changed chunk\ncarries a `Keep` / `Reject` control. The User can also keep or reject a whole\nfile, or the whole list at once. A chunk is the smallest unit `git add -i`\nwould offer if you split to the end: one maximal run of changed lines.\n\nThe Session header's change count is the standing way back to that page, and\n`/review` opens it.\n\n## A rejection is already done\n\nRejecting a chunk reverts it in the working tree and records the decision on the\nSession. That record is projected back into your context as a note listing each\nrejected chunk by path and the text it added. Therefore:\n\n- After a rejection note appears, the code is gone. Re-read the file before\n  building on it; never assume your edit is still there.\n- Do not re-apply a rejected change, and do not re-introduce it in another form,\n  unless the User asks for it.\n- If a rejection removed something you still believe is required, say so in your\n  next message and let the User decide. Do not silently work around it.\n\n## Write changes that are cheap to review\n\n- One logical change per tool call. Two unrelated edits in one call become one\n  chunk that can only be kept or rejected as a unit.\n- Keep the diff minimal: no unrelated reformatting, no whole-file rewrite where\n  an edit will do.\n- Describe what changed in the message that follows the call, so the User can\n  decide each chunk without re-deriving your intent.\n\n## When the User keeps everything\n\nSilence means no outstanding rejection. Carry on; the accepted changes are in\nthe files and need no acknowledgement.\n";
//# sourceMappingURL=skill.d.ts.map