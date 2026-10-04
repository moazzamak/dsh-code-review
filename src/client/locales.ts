/** `codeReview` namespace dictionaries. */

/** Dictionary namespace owned by this plugin. */
export const NS = 'codeReview'

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'command.review.label': '审阅改动',
  'command.review.description': '在右侧栏中打开最近一轮改动的逐文件对比',
} as const

/** English dictionary, key-identical to the Chinese source of truth. */
export const en: Record<CodeReviewKey, string> = {
  'command.review.label': 'Review changes',
  'command.review.description': 'Open the newest turn\'s changed files, compared one by one, in the sidebar',
}

/** Key domain of the `codeReview` namespace (zh is the source of truth). */
export type CodeReviewKey = keyof typeof zh
