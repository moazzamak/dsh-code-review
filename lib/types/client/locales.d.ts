/** `codeReview` namespace dictionaries. */
/** Dictionary namespace owned by this plugin. */
export declare const NS = "codeReview";
/** Simplified Chinese dictionary (the key-set source of truth). */
export declare const zh: {
    readonly 'command.review.label': "审阅改动";
    readonly 'command.review.description': "在右侧栏中打开最近一轮改动的逐文件对比";
};
/** English dictionary, key-identical to the Chinese source of truth. */
export declare const en: Record<CodeReviewKey, string>;
/** Key domain of the `codeReview` namespace (zh is the source of truth). */
export type CodeReviewKey = keyof typeof zh;
//# sourceMappingURL=locales.d.ts.map