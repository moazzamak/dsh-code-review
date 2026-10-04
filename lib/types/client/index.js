/**
 * Browser half of the code-review pack: the `/review` command.
 *
 * The command does one thing — reveal the newest recorded turn's comparison in
 * the right Sidebar, the per-file diff view dsh ships for a turn's changes. It
 * is offered exactly while that view's tab type is registered, the Session's
 * column is mounted, and the Session has a turn whose changes were recorded, so
 * a dsh build or a Session with nothing to show hides the command instead of
 * offering an action that cannot open anything.
 *
 * The coordinates come from the Session's own event window, which the browser
 * already holds for the conversation it is drawing: `workspace/changes` is
 * appended once per top-level turn, and its sequence is what the comparison
 * view reads the diff by. The window is the only seq-free path to them — every
 * route the comparison view serves takes the sequence as an input, and its
 * address builder and tab kind are module-private, which is why
 * `src/protocol.ts` restates them.
 *
 * The window is borrowed, not owned: `sessions.binding()` returns nothing for a
 * Session the browser is not already retaining, and that is treated as "nothing
 * to open" rather than as an error.
 * @module @deepseek-ai/dsh-code-review/client
 */
import { en, NS, zh } from "./locales.js";
import { changesReviewAddress, CHANGES_REVIEW_KIND, isLatestChanges, WORKSPACE_CHANGES_EVENT, } from "../protocol.js";
/** Required browser services: the command surface, copy, the Sessions service, and the right Sidebar with its tab registry. */
export const inject = ['commandUi', 'locale', 'sessions', 'sidebarRight', 'sidebarRightTabs'];
/** The slash command this pack contributes. */
export const REVIEW_COMMAND = 'review';
/**
 * Client plugin body: register the dictionaries and the `/review` command.
 * @param ctx - client root context.
 */
export function apply(ctx) {
    const t = ctx.locale.bind(NS);
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'code-review-pack: dictionaries');
    ctx.effect(() => ctx.commandUi.register({
        name: REVIEW_COMMAND,
        label: () => t('command.review.label'),
        description: () => t('command.review.description'),
        available: session => ctx.sidebarRightTabs.get(CHANGES_REVIEW_KIND) !== undefined
            && canNavigate(ctx, session.sessionId)
            && newestChanges(ctx, session.sessionId) !== undefined,
        ui: {
            kind: 'action',
            run: session => { openNewestReview(ctx, session.sessionId); },
        },
    }), 'code-review-pack: /review');
}
/**
 * Reveal the newest recorded turn's comparison.
 *
 * Nothing is thrown when the coordinates have gone: the command surface does not
 * render a thrown action, so a throw would replace a command that does nothing
 * with one that breaks the input. `available` already keeps the command hidden
 * while there is nothing to open, so this path is the race between a menu
 * refresh and a pick, and it is reported rather than hidden.
 * @param ctx - client root context carrying the right Sidebar's navigation face.
 * @param sessionId - the Session the command was invoked in.
 */
function openNewestReview(ctx, sessionId) {
    const coordinates = newestChanges(ctx, sessionId);
    if (coordinates === undefined) {
        report(`Session "${sessionId}" has no recorded turn changes to open`);
        return;
    }
    try {
        ctx.sidebarRight.openResource(changesReviewAddress({ sessionId, seq: coordinates.seq, turn: coordinates.turn }));
    }
    catch (error) {
        report(`could not open the newest changes: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * The newest recorded turn in one Session's loaded event window.
 *
 * Scanned back to front because the window is in ascending sequence order and
 * only its newest announcements can still be reviewed. The first
 * `workspace/changes` event wins: an announcement whose payload does not name a
 * turn is refused rather than skipped, because skipping would open an older
 * turn than the one the User just made.
 * @param ctx - client root context carrying the Sessions service.
 * @param sessionId - Session whose retained window is read.
 * @returns openable coordinates, or undefined when this window carries none.
 */
function newestChanges(ctx, sessionId) {
    const binding = ctx.sessions.binding(sessionId);
    if (binding === undefined)
        return undefined;
    const { entries } = binding.eventSource.getSnapshot();
    for (let index = entries.length - 1; index >= 0; index -= 1) {
        const entry = entries[index];
        if (entry === undefined)
            continue;
        const announcement = announcementOf(entry);
        if (announcement === undefined)
            continue;
        const candidate = { seq: announcement.seq, turn: announcement.data.turn };
        return isLatestChanges(candidate) ? candidate : undefined;
    }
    return undefined;
}
/**
 * Read one window entry as a change announcement.
 *
 * The event union this pack compiles against was written before dsh 0.2 added
 * `workspace/changes`, so the discriminant is read through a minimal local
 * shape: the runtime appends the event (the recorder that owns it appends
 * `{ turn }` once per top-level turn) and the declaration simply does not name
 * it yet. Widening here keeps the rest of the scan typed.
 * @param entry - one entry of the Session's loaded event window.
 * @returns the announcing sequence and payload, or undefined for any other entry.
 */
function announcementOf(entry) {
    if (entry.type !== 'event')
        return undefined;
    const event = entry.event;
    return event.type === WORKSPACE_CHANGES_EVENT ? { seq: event.seq, data: event.data } : undefined;
}
/**
 * Whether a navigation from this Session would be seen.
 *
 * dsh 0.2 replaced 0.1.5's `isMounted()` with the mounted-Session snapshot, and
 * `openResource` refuses while no seat is mounted. A Host that reports neither
 * is treated as navigable: the open call then reports its own refusal, which
 * beats hiding `/review` on a Host that renamed the field.
 * @param ctx - client root context carrying the right Sidebar.
 * @param sessionId - Session the command was invoked in.
 * @returns whether the right Sidebar holds a column for this Session.
 */
function canNavigate(ctx, sessionId) {
    const face = ctx.sidebarRight;
    if (face.mounted === undefined)
        return true;
    return face.mounted.getSnapshot() === sessionId;
}
/**
 * Report one `/review` failure where a developer can see it.
 * @param detail - what went wrong, in one clause.
 */
function report(detail) {
    console.warn(`code-review-pack: /review ${detail}`);
}
//# sourceMappingURL=index.js.map