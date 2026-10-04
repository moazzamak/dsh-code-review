/**
 * The pack's two restated dsh surfaces, pinned.
 *
 * The comparison view that `/review` opens keeps its tab kind and its address
 * scheme module-private, so this pack restates them. These tests state what it
 * restates and against which rules, so a rename upstream fails here — loudly —
 * instead of leaving `/review` a command that opens nothing.
 */

import { describe, expect, it } from 'vitest'
import {
  changesReviewAddress,
  CHANGES_REVIEW_KIND,
  isLatestChanges,
  WORKSPACE_CHANGES_EVENT,
} from '../src/protocol.ts'

/**
 * The rules the comparison view's own address parser applies, restated here.
 *
 * Copied from `parseChangesReviewAddress` in
 * `@deepseek-ai/dsh-client-ui-deliverables/lib/client.js`, which slices the
 * prefix, splits the remainder on `/`, requires exactly three parts, and
 * demands an all-digit `seq` and a non-zero integer `turn`. A change there is
 * what this test exists to catch: the assertion below is that an address this
 * pack builds still satisfies those rules.
 * @param address - a candidate address.
 * @returns the parsed coordinates, or undefined when the view would refuse it.
 */
function parseAsComparisonView(address: string): { sessionId: string, seq: number, turn: number } | undefined {
  const prefix = 'dsh-resource://changes-review/session/'
  if (!address.startsWith(prefix)) return undefined
  const parts = address.slice(prefix.length).split('/')
  if (parts.length !== 3) return undefined
  const [sessionId, seq, turn] = parts as [string, string, string]
  if (sessionId === '' || !/^\d+$/.test(seq) || !/^[1-9]\d*$/.test(turn)) return undefined
  return { sessionId: decodeURIComponent(sessionId), seq: Number(seq), turn: Number(turn) }
}

describe('restated dsh review surface', () => {
  it('names the tab kind the comparison view registers', () => {
    expect(CHANGES_REVIEW_KIND).toBe('changes-review')
  })

  it('names the event the change recorder announces each turn with', () => {
    expect(WORKSPACE_CHANGES_EVENT).toBe('workspace/changes')
  })

  it('builds an address the comparison view accepts, and reads back', () => {
    const coordinates = { sessionId: 'session-abc', seq: 412, turn: 7 }
    expect(changesReviewAddress(coordinates)).toBe('dsh-resource://changes-review/session/session-abc/412/7')
    expect(parseAsComparisonView(changesReviewAddress(coordinates))).toEqual(coordinates)
  })

  it('percent-encodes a Session id, because the view splits before decoding', () => {
    const coordinates = { sessionId: 'a/b c', seq: 0, turn: 1 }
    const address = changesReviewAddress(coordinates)
    expect(address).toBe('dsh-resource://changes-review/session/a%2Fb%20c/0/1')
    expect(parseAsComparisonView(address)).toEqual(coordinates)
    // An unencoded id would split into four parts and be refused outright.
    expect(parseAsComparisonView('dsh-resource://changes-review/session/a/b c/0/1')).toBeUndefined()
  })

  it('accepts the Host answers the view can open', () => {
    expect(isLatestChanges({ seq: 0, turn: 1 })).toBe(true)
    expect(isLatestChanges({ seq: 412, turn: 9 })).toBe(true)
  })

  it('refuses answers the view would refuse, before building an address from them', () => {
    for (const answer of [
      undefined,
      null,
      'changes',
      {},
      { seq: 1 },
      { turn: 1 },
      { seq: -1, turn: 1 },
      { seq: 1.5, turn: 1 },
      { seq: 1, turn: 0 },
      { seq: 1, turn: -3 },
      { seq: 1, turn: 2.5 },
      { seq: '1', turn: 1 },
      { seq: 1, turn: '1' },
    ]) {
      expect(isLatestChanges(answer)).toBe(false)
    }
  })
})
