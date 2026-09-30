/**
 * Browser half of the code-review pack: the `/review` command.
 *
 * The command does one thing — reveal the pinned Changes page in the right
 * Sidebar, which is the page DSH already keeps for outstanding chunks. It is
 * offered exactly while that column is mounted: an action whose page has
 * nowhere to open would be a silent no-op, and a command that silently does
 * nothing is worse than a command that is absent.
 *
 * The page's kind is named by the package that registers it rather than
 * repeated as a string here.
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
/** Required browser services: the command surface, copy, and the right Sidebar. */
export declare const inject: string[];
/** The slash command this pack contributes. */
export declare const REVIEW_COMMAND = "review";
/**
 * Client plugin body: register the dictionaries and the `/review` command.
 * @param ctx - client root context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map