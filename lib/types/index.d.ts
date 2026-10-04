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
import type { Context } from '@deepseek-ai/cordis';
/** Stable Cordis plugin name. */
export declare const name = "code-review-pack";
/**
 * Plugin body: contribute the review workflow as a runtime Skill.
 *
 * A Host without the Skill registry (a face that never loads skills) simply
 * gets no contribution rather than a failed row, which is the same posture the
 * review surface itself takes toward a missing prompt service.
 * @param ctx - host context carrying the Skill registry.
 */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map