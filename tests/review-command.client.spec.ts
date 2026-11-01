/**
 * Browser half: `/review` is offered exactly while the comparison view is
 * registered, the Session's column is mounted, and the Session holds a recorded
 * turn — and it opens that turn's address. The same half takes the pack's
 * precedence over the built-in turn-tail diff card, and both the command and
 * the suppression are released with the fiber (HMR safety).
 */

import { Context } from '@deepseek-ai/cordis'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { describe, expect, it, vi } from 'vitest'
import { apply, inject, REVIEW_COMMAND } from '../src/client/index.ts'
import { en, NS, zh } from '../src/client/locales.ts'
import {
  selectSuppressedChangeCard,
  SUPPRESSION_PRIORITY,
  SuppressedChangeCard,
} from '../src/client/turn-tail.ts'
import { changesReviewAddress, CHANGES_REVIEW_KIND, TURN_TAIL_SLOT, WORKSPACE_CHANGES_EVENT } from '../src/protocol.ts'

/** The command contribution, as the real registry hands it back. */
interface Contribution {
  name: string
  label: () => string
  description: () => string
  available: (session: { sessionId: string }) => boolean
  ui: { kind: string, run: (session: { sessionId: string }) => void }
}

/** One entry of the Session's loaded event window, as the browser holds it. */
type Entry =
  | { readonly type: 'event', readonly event: { readonly type: string, readonly seq: number, readonly data: unknown } }
  | { readonly type: 'transient', readonly event: { readonly type: string } }

/** One `workspace/changes` announcement, as the recorder appends it. */
function announced(seq: number, turn: number): Entry {
  return { type: 'event', event: { type: WORKSPACE_CHANGES_EVENT, seq, data: { turn } } }
}

/** Stage options for a bench. */
interface BenchOptions {
  /** Whether the comparison view's tab type is registered on this Host. */
  readonly reviewTypeRegistered?: boolean
  /** Session whose right column is mounted. */
  readonly mountedSessionId?: string
  /** Report no mounted column at all, as a Session with no seat does. */
  readonly noColumn?: boolean
  /** Omit the mounted-Session snapshot entirely, as a renamed Host field would. */
  readonly withoutMountedField?: boolean
  /** Entries of the retained Session's event window. */
  readonly entries?: readonly Entry[]
  /** Session the Sessions service retains a binding for. */
  readonly retainedSessionId?: string
  /** Make the navigation refuse, as an unmounted seat does. */
  readonly navigationRefused?: boolean
}

/** One chain entry this half contributed through the slot renderer. */
interface SlotContribution {
  readonly options: {
    readonly name: string
    readonly select: (owner: unknown) => unknown
    readonly priority: number
    readonly registrant: string
  }
  readonly component: unknown
}

/**
 * Boot the browser half over the services it declares, with fakes that record
 * the registrations, the slot contributions, and the addresses the command
 * opened.
 * @param options - staged Host answers.
 */
async function bench(options: BenchOptions = {}): Promise<{
  ctx: Context
  fiber: ReturnType<Context['plugin']>
  contributions: Contribution[]
  contributionsBySlot: Map<string, SlotContribution>
  opened: string[]
  warnings: string[]
}> {
  const {
    reviewTypeRegistered = true,
    mountedSessionId = 'session-abc',
    noColumn = false,
    withoutMountedField = false,
    entries = [announced(12, 3)],
    retainedSessionId = 'session-abc',
    navigationRefused = false,
  } = options
  const contributions: Contribution[] = []
  const contributionsBySlot = new Map<string, SlotContribution>()
  const opened: string[] = []
  const warnings: string[] = []
  vi.spyOn(console, 'warn').mockImplementation((message: string) => { warnings.push(message) })
  const ctx = new Context()
  ctx.provide('locale', new LocaleRuntime(ctx))
  ctx.provide('commandUi', {
    register(contribution: Contribution) {
      contributions.push(contribution)
      return () => {
        const at = contributions.indexOf(contribution)
        if (at >= 0) contributions.splice(at, 1)
      }
    },
  } as never)
  ctx.provide('slots', {
    inject(key: string, contribute: () => () => void) {
      const dispose = contribute()
      return () => { dispose() }
    },
    register(options: SlotContribution['options'], component: unknown) {
      const contribution: SlotContribution = { options, component }
      contributionsBySlot.set(options.name, contribution)
      return () => {
        if (contributionsBySlot.get(options.name) === contribution) contributionsBySlot.delete(options.name)
      }
    },
  } as never)
  ctx.provide('sidebarRightTabs', {
    get: (kind: string) => kind === CHANGES_REVIEW_KIND && reviewTypeRegistered ? { kind } : undefined,
  } as never)
  ctx.provide('sidebarRight', {
    ...withoutMountedField
      ? {}
      : { mounted: { getSnapshot: () => noColumn ? undefined : mountedSessionId } },
    openResource: (address: string) => {
      if (navigationRefused) throw new Error('sidebarRight: no session surface is mounted')
      opened.push(address)
    },
  } as never)
  ctx.provide('sessions', {
    binding: (sessionId: string) => sessionId === retainedSessionId
      ? { sessionId, eventSource: { getSnapshot: () => ({ entries }) } }
      : undefined,
  } as never)
  const fiber = ctx.plugin({ inject: [...inject], apply })
  await fiber.await()
  return { ctx, fiber, contributions, contributionsBySlot, opened, warnings }
}

/** One closing Turn's owner currency, as the chat view hands it to the chain. */
function ownerWith(deliverables: unknown): never {
  return { turn: { data: { get: (key: string) => key === 'deliverables' ? deliverables : undefined } }, seq: 99 } as never
}

describe('code-review pack browser half', () => {
  it('declares the services it binds', () => {
    expect(inject).toEqual(['commandUi', 'locale', 'sessions', 'sidebarRight', 'sidebarRightTabs', 'slots'])
  })

  it('registers /review as an action', async () => {
    const { fiber, contributions } = await bench()
    expect(contributions).toHaveLength(1)
    expect(contributions[0]?.name).toBe(REVIEW_COMMAND)
    expect(contributions[0]?.ui.kind).toBe('action')
    await fiber.dispose()
    expect(contributions).toEqual([])
  })

  it('offers the command exactly while its three preconditions hold', async () => {
    const ready = await bench()
    expect(ready.contributions[0]?.available({ sessionId: 'session-abc' })).toBe(true)
    await ready.fiber.dispose()

    const noView = await bench({ reviewTypeRegistered: false })
    expect(noView.contributions[0]?.available({ sessionId: 'session-abc' })).toBe(false)
    await noView.fiber.dispose()

    const notMounted = await bench({ noColumn: true })
    expect(notMounted.contributions[0]?.available({ sessionId: 'session-abc' })).toBe(false)
    await notMounted.fiber.dispose()

    const otherColumn = await bench({ mountedSessionId: 'session-elsewhere' })
    expect(otherColumn.contributions[0]?.available({ sessionId: 'session-abc' })).toBe(false)
    await otherColumn.fiber.dispose()

    const nothingRecorded = await bench({ entries: [{ type: 'event', event: { type: 'turn/start', seq: 1, data: {} } }] })
    expect(nothingRecorded.contributions[0]?.available({ sessionId: 'session-abc' })).toBe(false)
    await nothingRecorded.fiber.dispose()

    const notRetained = await bench({ retainedSessionId: 'session-elsewhere' })
    expect(notRetained.contributions[0]?.available({ sessionId: 'session-abc' })).toBe(false)
    await notRetained.fiber.dispose()
  })

  it('treats a Host that reports no mounted Session as navigable', async () => {
    const { contributions, fiber } = await bench({ withoutMountedField: true })
    expect(contributions[0]?.available({ sessionId: 'session-abc' })).toBe(true)
    await fiber.dispose()
  })

  it('opens the newest announced turn, ignoring other events and live chunks', async () => {
    const { contributions, opened, fiber } = await bench({
      entries: [
        announced(4, 1),
        { type: 'event', event: { type: 'tool/result', seq: 9, data: {} } },
        { type: 'transient', event: { type: 'assistant/live-chunk' } },
        announced(12, 3),
        { type: 'transient', event: { type: 'assistant/live-chunk' } },
      ],
    })
    contributions[0]?.ui.run({ sessionId: 'session-abc' })
    expect(opened).toEqual([changesReviewAddress({ sessionId: 'session-abc', seq: 12, turn: 3 })])
    await fiber.dispose()
  })

  it('encodes a Session id, because the comparison view splits before decoding', async () => {
    const { contributions, opened, fiber } = await bench({
      mountedSessionId: 'a/b c',
      retainedSessionId: 'a/b c',
      entries: [announced(0, 1)],
    })
    contributions[0]?.ui.run({ sessionId: 'a/b c' })
    expect(opened).toEqual(['dsh-resource://changes-review/session/a%2Fb%20c/0/1'])
    await fiber.dispose()
  })

  it('opens nothing, and refuses the newest announcement whose payload names no turn', async () => {
    const { contributions, opened, fiber } = await bench({
      entries: [announced(4, 1), { type: 'event', event: { type: WORKSPACE_CHANGES_EVENT, seq: 12, data: {} } }],
    })
    // Opening the older turn would show a diff the User did not just make.
    expect(contributions[0]?.available({ sessionId: 'session-abc' })).toBe(false)
    contributions[0]?.ui.run({ sessionId: 'session-abc' })
    expect(opened).toEqual([])
    await fiber.dispose()
  })

  it('reports a navigation the right Sidebar refuses instead of throwing', async () => {
    const { contributions, opened, warnings, fiber } = await bench({ navigationRefused: true })
    expect(() => { contributions[0]?.ui.run({ sessionId: 'session-abc' }) }).not.toThrow()
    expect(opened).toEqual([])
    expect(warnings.join('\n')).toContain('no session surface is mounted')
    await fiber.dispose()
  })

  it('reports, rather than throwing, when the coordinates vanished before the pick', async () => {
    const { contributions, warnings, fiber } = await bench()
    contributions[0]?.ui.run({ sessionId: 'session-gone' })
    expect(warnings.join('\n')).toContain('session-gone')
    await fiber.dispose()
  })

  it('localizes its own copy through its own namespace', async () => {
    const { ctx, fiber, contributions } = await bench()
    ctx.locale.setLocale('zh')
    expect(contributions[0]?.label()).toBe(zh['command.review.label'])
    expect(contributions[0]?.description()).toBe(zh['command.review.description'])
    ctx.locale.setLocale('en')
    expect(contributions[0]?.label()).toBe(en['command.review.label'])
    expect(contributions[0]?.description()).toBe(en['command.review.description'])
    await fiber.dispose()
    expect(ctx.locale.bind(NS)('command.review.label')).not.toBe(en['command.review.label'])
  })

  it('keeps the English dictionary key-identical to the Chinese source of truth', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(zh).sort())
  })
})

describe('code-review pack precedence over the built-in diff card', () => {
  it('registers into the closing-turn chain below the built-in entry', async () => {
    const { contributionsBySlot, fiber } = await bench()
    const suppression = contributionsBySlot.get(TURN_TAIL_SLOT)
    expect(suppression).toBeDefined()
    expect(suppression?.component).toBe(SuppressedChangeCard)
    expect(suppression?.options.priority).toBe(SUPPRESSION_PRIORITY)
    // Ascending order: a lower band is tried first, so the election does not
    // depend on which of the two plugins loaded first.
    expect(suppression?.options.priority).toBeLessThan(0)
    expect(suppression?.options.registrant).toContain('dsh-code-review')
    await fiber.dispose()
    expect(contributionsBySlot.has(TURN_TAIL_SLOT)).toBe(false)
  })

  it('suppresses the card, drawing nothing, on a turn that recorded changes', async () => {
    const { contributionsBySlot, fiber } = await bench()
    const suppression = contributionsBySlot.get(TURN_TAIL_SLOT)
    expect(suppression?.options.select(ownerWith({ changes: { seq: 12 }, produced: ['a.ts'] }))).not.toBeNull()
    expect(SuppressedChangeCard()).toBeNull()
    await fiber.dispose()
  })

  it('leaves the built-in card alone when the turn recorded no changes', async () => {
    const { contributionsBySlot, fiber } = await bench()
    const select = contributionsBySlot.get(TURN_TAIL_SLOT)?.options.select
    // No payload at all, a payload with no announcement, and an explicit null
    // are all the same answer: nothing to suppress, so the built-in claims it.
    expect(select?.(ownerWith(undefined))).toBeNull()
    expect(select?.(ownerWith({ produced: ['a.ts'] }))).toBeNull()
    expect(select?.(ownerWith({ changes: null, produced: ['a.ts'] }))).toBeNull()
    await fiber.dispose()
  })

  it('leaves a turn that declared presented files to the built-in entry', async () => {
    const { contributionsBySlot, fiber } = await bench()
    const select = contributionsBySlot.get(TURN_TAIL_SLOT)?.options.select
    // The built-in entry draws the declared-file row as well as the card; the
    // pack replaces only the card, so it must not take the row away with it.
    expect(select?.(ownerWith({ changes: { seq: 12 }, presented: [{ path: 'a.ts' }] }))).toBeNull()
    // An empty list is not a row: the card is still the only thing drawn.
    expect(select?.(ownerWith({ changes: { seq: 12 }, presented: [] }))).not.toBeNull()
    await fiber.dispose()
  })

  it('keeps the pack when the Host has no slot renderer', async () => {
    const contributions: Contribution[] = []
    const ctx = new Context()
    ctx.provide('locale', new LocaleRuntime(ctx))
    ctx.provide('commandUi', {
      register(contribution: Contribution) {
        contributions.push(contribution)
        return () => {
          const at = contributions.indexOf(contribution)
          if (at >= 0) contributions.splice(at, 1)
        }
      },
    } as never)
    ctx.provide('sidebarRightTabs', { get: () => undefined } as never)
    ctx.provide('sidebarRight', {} as never)
    ctx.provide('sessions', { binding: () => undefined } as never)
    const fiber = ctx.plugin({ inject: ['commandUi', 'locale'], apply })
    await fiber.await()
    expect(contributions.map(contribution => contribution.name)).toEqual([REVIEW_COMMAND])
    await fiber.dispose()
  })

  it('declines every payload shape it does not recognize', () => {
    // A renamed or re-shaped payload must decline, never claim: claiming a turn
    // the pack cannot reason about would hide a card nothing replaces.
    for (const payload of [undefined, 42, 'changes', [], null, {}, { changes: undefined }]) {
      expect(selectSuppressedChangeCard(ownerWith(payload))).toBeNull()
    }
  })
})
