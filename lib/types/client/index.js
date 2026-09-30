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
import { CHANGES_KIND } from '@deepseek-ai/dsh-client-ui-sidebar-documentpreview/client';
import { en, NS, zh } from "./locales.js";
/** Required browser services: the command surface, copy, and the right Sidebar. */
export const inject = ['commandUi', 'locale', 'sidebarRight'];
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
        available: () => ctx.sidebarRight.isMounted(),
        ui: {
            kind: 'action',
            run: () => { ctx.sidebarRight.openTab(CHANGES_KIND); },
        },
    }), 'code-review-pack: /review');
}
//# sourceMappingURL=index.js.map