window.__ModuleLoader__.load({
	id: "@moazzamak/dsh-code-review",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region src/client/locales.ts
		/** `codeReview` namespace dictionaries. */
		/** Dictionary namespace owned by this plugin. */
		const NS = "codeReview";
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"command.review.label": "审阅改动",
			"command.review.description": "在右侧栏中打开最近一轮改动的逐文件对比"
		};
		/** English dictionary, key-identical to the Chinese source of truth. */
		const en = {
			"command.review.label": "Review changes",
			"command.review.description": "Open the newest turn's changed files, compared one by one, in the sidebar"
		};
		/** Closing-turn chain the built-in changed-files card is contributed to. */
		const TURN_TAIL_SLOT = "conversation.chat.turnTail";
		/**
		* Address scheme the comparison view claims.
		*
		* Restated rather than imported: the owning package keeps it module-private.
		*/
		const CHANGES_REVIEW_ADDRESS_PREFIX = "dsh-resource://changes-review/session/";
		/**
		* Whether a value carries coordinates the comparison view accepts.
		*
		* The bounds mirror that view's own parser, so a payload that named something
		* unopenable is refused here instead of producing a tab that cannot resolve.
		* @param value - candidate coordinates, of unknown shape.
		* @returns whether the value is openable review coordinates.
		*/
		function isLatestChanges(value) {
			if (typeof value !== "object" || value === null) return false;
			const { seq, turn } = value;
			return typeof seq === "number" && Number.isSafeInteger(seq) && seq >= 0 && typeof turn === "number" && Number.isSafeInteger(turn) && turn >= 1;
		}
		/**
		* The address the comparison view opens for one recorded turn.
		*
		* The Session id is percent-encoded because that parser splits the remainder on
		* `/` before decoding each part.
		* @param coordinates - the Session, the announcing event, and the turn.
		* @returns a `dsh-resource://changes-review/session/…` address.
		*/
		function changesReviewAddress(coordinates) {
			const { sessionId, seq, turn } = coordinates;
			return `${CHANGES_REVIEW_ADDRESS_PREFIX}${encodeURIComponent(sessionId)}/${seq}/${turn}`;
		}
		/** Registrant identity carried into slot diagnostics. */
		const REGISTRANT = "@moazzamak/dsh-code-review";
		/**
		* Election marker: the entry claimed a Turn in order to draw nothing.
		*
		* A module constant rather than a fresh object, so the selector stays the pure
		* function of the owner the chain contract requires — two renders of one Turn
		* elect the same value and React performs no gratuitous re-render.
		*/
		const SUPPRESSED_CHANGE_CARD = Symbol("code-review-pack: suppressed change card");
		/**
		* Read the closing Turn's `deliverables` payload.
		* @param owner - turn-tail owner currency for the closing assistant.
		* @returns the payload, or undefined when this Turn published none.
		*/
		function deliverablesOf(owner) {
			const value = owner.turn.data.get?.("deliverables");
			return isRecord(value) ? value : void 0;
		}
		/**
		* Whether a value is a plain record.
		*
		* The shape test every restated payload goes through: a payload this pack does
		* not recognize must decline the Turn, because claiming one would hide a card
		* that nothing replaces.
		* @param value - value to test, of unknown shape.
		* @returns whether the value is a non-null, non-array object.
		*/
		function isRecord(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		/**
		* Elect the pack, and suppress the built-in card, on the Turns it replaces.
		*
		* Pure, as the chain contract requires: a function of the owner alone, with no
		* side effects and no reads outside it.
		* @param owner - turn-tail owner currency for the closing assistant.
		* @returns the suppression marker, or null to leave the built-in card alone.
		*/
		function selectSuppressedChangeCard(owner) {
			const deliverables = deliverablesOf(owner);
			if (deliverables === void 0 || !isRecord(deliverables.changes)) return null;
			if (Array.isArray(deliverables.presented) && deliverables.presented.length > 0) return null;
			return SUPPRESSED_CHANGE_CARD;
		}
		/**
		* The card the pack replaces by drawing nothing.
		*
		* `/review` opens the same comparison the suppressed card's header opened, so
		* the transcript carries no second entry point into it and the sidebar stays
		* the one place a Turn's changes are read.
		* @returns null, always: suppressing is the whole contribution.
		*/
		function SuppressedChangeCard() {
			return null;
		}
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
		function suppressBuiltInChangeCard(ctx) {
			const slots = ctx.get("slots");
			if (slots === void 0) return;
			try {
				ctx.effect(() => slots.inject(TURN_TAIL_SLOT, () => slots.register({
					name: TURN_TAIL_SLOT,
					select: selectSuppressedChangeCard,
					priority: -1,
					registrant: REGISTRANT
				}, SuppressedChangeCard)), "code-review-pack: suppress the built-in change card");
			} catch (error) {
				report$1(`could not suppress the built-in change card: ${error instanceof Error ? error.message : String(error)}`);
			}
		}
		/**
		* Report one suppression failure where a developer can see it.
		* @param detail - what went wrong, in one clause.
		*/
		function report$1(detail) {
			console.warn(`code-review-pack: ${detail}`);
		}
		//#endregion
		//#region src/client/index.ts
		/** Required browser services: the command surface, copy, the Sessions service, the right Sidebar with its tab registry, and the slot renderer the suppression contributes through. */
		const inject = [
			"commandUi",
			"locale",
			"sessions",
			"sidebarRight",
			"sidebarRightTabs",
			"slots"
		];
		/** The slash command this pack contributes. */
		const REVIEW_COMMAND = "review";
		/**
		* Client plugin body: register the dictionaries, the `/review` command, and the
		* pack's precedence over the built-in turn-tail diff card.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "code-review-pack: dictionaries");
			suppressBuiltInChangeCard(ctx);
			ctx.effect(() => ctx.commandUi.register({
				name: REVIEW_COMMAND,
				label: () => t("command.review.label"),
				description: () => t("command.review.description"),
				available: (session) => ctx.sidebarRightTabs.get("changes-review") !== void 0 && canNavigate(ctx, session.sessionId) && newestChanges(ctx, session.sessionId) !== void 0,
				ui: {
					kind: "action",
					run: (session) => {
						openNewestReview(ctx, session.sessionId);
					}
				}
			}), "code-review-pack: /review");
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
			if (coordinates === void 0) {
				report(`Session "${sessionId}" has no recorded turn changes to open`);
				return;
			}
			try {
				ctx.sidebarRight.openResource(changesReviewAddress({
					sessionId,
					seq: coordinates.seq,
					turn: coordinates.turn
				}));
			} catch (error) {
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
			if (binding === void 0) return void 0;
			const { entries } = binding.eventSource.getSnapshot();
			for (let index = entries.length - 1; index >= 0; index -= 1) {
				const entry = entries[index];
				if (entry === void 0) continue;
				const announcement = announcementOf(entry);
				if (announcement === void 0) continue;
				const candidate = {
					seq: announcement.seq,
					turn: announcement.data.turn
				};
				return isLatestChanges(candidate) ? candidate : void 0;
			}
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
			if (entry.type !== "event") return void 0;
			const event = entry.event;
			return event.type === "workspace/changes" ? {
				seq: event.seq,
				data: event.data
			} : void 0;
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
			if (face.mounted === void 0) return true;
			return face.mounted.getSnapshot() === sessionId;
		}
		/**
		* Report one `/review` failure where a developer can see it.
		* @param detail - what went wrong, in one clause.
		*/
		function report(detail) {
			console.warn(`code-review-pack: /review ${detail}`);
		}
		//#endregion
		exports.REVIEW_COMMAND = REVIEW_COMMAND;
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map