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
import type { Context as ClientContext } from '@deepseek-ai/cordis';
import { type CodeReviewKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** The `/review` command's label and description. */
        codeReview: CodeReviewKey;
    }
}
/** Required browser services: the command surface, copy, the Sessions service, and the right Sidebar with its tab registry. */
export declare const inject: string[];
/** The slash command this pack contributes. */
export declare const REVIEW_COMMAND = "review";
/**
 * Client plugin body: register the dictionaries and the `/review` command.
 * @param ctx - client root context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map