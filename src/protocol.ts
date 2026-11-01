/**
 * The one place this pack names DeepSeek Harness's review surface.
 *
 * Every fact here restates a surface this pack does not own, and each is pinned
 * by `tests/protocol.spec.ts` so a rename upstream fails in CI rather than
 * leaving `/review` a command that opens nothing:
 *
 * - `changes-review` is the right-Sidebar tab kind registered by
 *   `@deepseek-ai/dsh-client-ui-deliverables`, whose per-file comparison view
 *   replaced the pinned Changes page dsh 0.1.5 shipped. That package exports
 *   neither the kind nor the address builder — only `apply` and `inject` — so
 *   the scheme and the kind are restated here.
 * - The address is that type's `dsh-resource://` claim. Its own parser accepts
 *   exactly `<encoded sessionId>/<seq>/<turn>`, with `seq` all digits and
 *   `turn` a non-zero integer, and refuses anything else, so a malformed
 *   address fails rather than opening a mislabelled tab.
 * - The announcing event is `workspace/changes`, appended once per top-level
 *   turn by `@deepseek-ai/dsh-workspace-changes` carrying only `{ turn }`; the
 *   event's sequence identifies the recorded diff.
 * - `conversation.chat.turnTail` is the chat view's closing-turn chain, which
 *   `@deepseek-ai/dsh-client-ui-deliverables` also contributes to in order to
 *   draw the changed-files card this pack takes precedence over.
 * @module @deepseek-ai/dsh-code-review/protocol
 */

/** Right-Sidebar tab kind owned by the comparison view this pack opens. */
export const CHANGES_REVIEW_KIND = 'changes-review'

/** Closing-turn chain the built-in changed-files card is contributed to. */
export const TURN_TAIL_SLOT = 'conversation.chat.turnTail'

/** Event type the change recorder appends once per top-level turn. */
export const WORKSPACE_CHANGES_EVENT = 'workspace/changes'

/**
 * Address scheme the comparison view claims.
 *
 * Restated rather than imported: the owning package keeps it module-private.
 */
const CHANGES_REVIEW_ADDRESS_PREFIX = 'dsh-resource://changes-review/session/'

/** One recorded turn's review coordinates. */
export interface LatestChanges {
  /** `workspace/changes` event sequence identifying the turn's recorded diff. */
  readonly seq: number
  /** Top-level turn number the event announced, carried for the tab title. */
  readonly turn: number
}

/**
 * Whether a value carries coordinates the comparison view accepts.
 *
 * The bounds mirror that view's own parser, so a payload that named something
 * unopenable is refused here instead of producing a tab that cannot resolve.
 * @param value - candidate coordinates, of unknown shape.
 * @returns whether the value is openable review coordinates.
 */
export function isLatestChanges(value: unknown): value is LatestChanges {
  if (typeof value !== 'object' || value === null) return false
  const { seq, turn } = value as { seq?: unknown, turn?: unknown }
  return typeof seq === 'number' && Number.isSafeInteger(seq) && seq >= 0
    && typeof turn === 'number' && Number.isSafeInteger(turn) && turn >= 1
}

/**
 * The address the comparison view opens for one recorded turn.
 *
 * The Session id is percent-encoded because that parser splits the remainder on
 * `/` before decoding each part.
 * @param coordinates - the Session, the announcing event, and the turn.
 * @returns a `dsh-resource://changes-review/session/…` address.
 */
export function changesReviewAddress(
  coordinates: { readonly sessionId: string, readonly seq: number, readonly turn: number },
): string {
  const { sessionId, seq, turn } = coordinates
  return `${CHANGES_REVIEW_ADDRESS_PREFIX}${encodeURIComponent(sessionId)}/${seq}/${turn}`
}
