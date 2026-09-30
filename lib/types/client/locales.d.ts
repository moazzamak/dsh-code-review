/** `codeReview` namespace dictionaries. */
/** Dictionary namespace owned by this plugin. */
export declare const NS = "codeReview";
/** Simplified Chinese dictionary (the key-set source of truth). */
export declare const zh: {
    readonly 'command.review.label': "审阅改动";
    readonly 'command.review.description': "打开“改动”页面，逐个保留或拒绝尚未处理的改动";
};
/** English dictionary, key-identical to the Chinese source of truth. */
export declare const en: Record<CodeReviewKey, string>;
/** Key domain of the `codeReview` namespace (zh is the source of truth). */
export type CodeReviewKey = keyof typeof zh;
//# sourceMappingURL=locales.d.ts.map