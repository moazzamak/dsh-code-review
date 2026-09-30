/** `codeReview` namespace dictionaries. */

/** Dictionary namespace owned by this plugin. */
export const NS = 'codeReview'

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'command.review.label': '审阅改动',
  'command.review.description': '打开“改动”页面，逐个保留或拒绝尚未处理的改动',
} as const

/** English dictionary, key-identical to the Chinese source of truth. */
export const en: Record<CodeReviewKey, string> = {
  'command.review.label': 'Review changes',
  'command.review.description': 'Open the Changes page to keep or reject outstanding changes',
}

/** Key domain of the `codeReview` namespace (zh is the source of truth). */
export type CodeReviewKey = keyof typeof zh
