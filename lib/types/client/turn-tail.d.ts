/**
 * The pack's precedence over dsh's own turn-tail diff card.
 *
 * dsh draws a changed-files card under each completed Turn — the
 * `conversation.chat.turnTail` chain entry contributed by
 * `@deepseek-ai/dsh-client-ui-deliverables` — and its header opens the same
 * per-file comparison `/review` opens. The card is the surface this pack takes
 * precedence over: with the pack installed, `/review` is the way into a Turn's
 * changes, and the card no longer appears in the transcript.
 *
 * The mechanism is the chain's own election. A chain entry's `select` runs in
 * ascending priority, the first non-null result elects that entry, and a null
 * passes to the next — so an entry that claims the turns the built-in card
 * would claim, and renders nothing, is exactly "the built-in card is
 * suppressed". This entry registers at `SUPPRESSION_PRIORITY`, below the
 * built-in's default 0, so the election does not depend on which of the two
 * plugins loaded first.
 *
 * **What it deliberately does not touch.** The built-in entry draws two things:
 * the changed-files card, and the row of files a Turn declared with the
 * `present` tool. Only the first has a substitute here, so this selector claims
 * a Turn only when the built-in has nothing but the card to draw — a Turn that
 * declared presented files keeps the built-in entry, and therefore keeps its
 * card alongside them rather than losing the row. Suppressing a surface the
 * pack cannot replace would be a regression, not precedence.
 *
 * The `deliverables` Turn data this reads is published data rather than an
 * import: `@deepseek-ai/dsh-client-ui-deliverables` is an optional peer, so the
 * shape is restated here the way `src/protocol.ts` restates the rest, and read
 * through a record test so a renamed payload declines instead of claiming.
 * @module @deepseek-ai/dsh-code-review/client/turn-tail
 */
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import type { TurnTailOwnerProps } from '@deepseek-ai/dsh-client-ui-chat/client';
/**
 * Chain position this entry runs at.
 *
 * Ascending, and lower than the built-in entry's default 0, so the election is
 * decided by the band rather than by plugin load order.
 */
export declare const SUPPRESSION_PRIORITY = -1;
/**
 * Election marker: the entry claimed a Turn in order to draw nothing.
 *
 * A module constant rather than a fresh object, so the selector stays the pure
 * function of the owner the chain contract requires — two renders of one Turn
 * elect the same value and React performs no gratuitous re-render.
 */
declare const SUPPRESSED_CHANGE_CARD: unique symbol;
/**
 * Elect the pack, and suppress the built-in card, on the Turns it replaces.
 *
 * Pure, as the chain contract requires: a function of the owner alone, with no
 * side effects and no reads outside it.
 * @param owner - turn-tail owner currency for the closing assistant.
 * @returns the suppression marker, or null to leave the built-in card alone.
 */
export declare function selectSuppressedChangeCard(owner: TurnTailOwnerProps): typeof SUPPRESSED_CHANGE_CARD | null;
/**
 * The card the pack replaces by drawing nothing.
 *
 * `/review` opens the same comparison the suppressed card's header opened, so
 * the transcript carries no second entry point into it and the sidebar stays
 * the one place a Turn's changes are read.
 * @returns null, always: suppressing is the whole contribution.
 */
export declare function SuppressedChangeCard(): null;
/**
 * Declare the pack's precedence over the built-in turn-tail diff card.
 *
 * Contributed for the pack row's lifetime through the slot renderer's
 * `inject`, which waits for the declaring chat view to be mounted and drops the
 * contribution again when it is not — so this change needs no ordering against
 * the package that declares the slot.
 *
 * A Host without the slot renderer keeps the rest of the pack: the `/review`
 * command and the Skill are the pack's product, and a client that cannot
 * compose this entry should lose the suppression rather than the pack.
 * @param ctx - client root context carrying the slot service.
 * @returns nothing.
 */
export declare function suppressBuiltInChangeCard(ctx: ClientContext): void;
export {};
//# sourceMappingURL=turn-tail.d.ts.map