window.__ModuleLoader__.load({
	id: "@moazzamak/dsh-code-review",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let _deepseek_ai_dsh_client_ui_sidebar_documentpreview_client = require("@deepseek-ai/dsh-client-ui-sidebar-documentpreview/client");
		//#region src/client/locales.ts
		/** `codeReview` namespace dictionaries. */
		/** Dictionary namespace owned by this plugin. */
		const NS = "codeReview";
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"command.review.label": "审阅改动",
			"command.review.description": "打开“改动”页面，逐个保留或拒绝尚未处理的改动"
		};
		/** English dictionary, key-identical to the Chinese source of truth. */
		const en = {
			"command.review.label": "Review changes",
			"command.review.description": "Open the Changes page to keep or reject outstanding changes"
		};
		//#endregion
		//#region src/client/index.ts
		/** Required browser services: the command surface, copy, and the right Sidebar. */
		const inject = [
			"commandUi",
			"locale",
			"sidebarRight"
		];
		/** The slash command this pack contributes. */
		const REVIEW_COMMAND = "review";
		/**
		* Client plugin body: register the dictionaries and the `/review` command.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "code-review-pack: dictionaries");
			ctx.effect(() => ctx.commandUi.register({
				name: REVIEW_COMMAND,
				label: () => t("command.review.label"),
				description: () => t("command.review.description"),
				available: () => ctx.sidebarRight.isMounted(),
				ui: {
					kind: "action",
					run: () => {
						ctx.sidebarRight.openTab(_deepseek_ai_dsh_client_ui_sidebar_documentpreview_client.CHANGES_KIND);
					}
				}
			}), "code-review-pack: /review");
		}
		//#endregion
		exports.REVIEW_COMMAND = REVIEW_COMMAND;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map