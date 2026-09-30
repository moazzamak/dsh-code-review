/**
 * Browser half: `/review` is offered exactly while the right Sidebar is
 * mounted, it opens the Changes page by the kind that page registers, and both
 * the command and the dictionaries are released with the fiber (HMR safety).
 */

import { Context } from '@deepseek-ai/cordis'
import { LocaleRuntime } from '@deepseek-ai/dsh-client-locale/client'
import { describe, expect, it } from 'vitest'
import { apply, inject, REVIEW_COMMAND } from '../src/client/index.ts'
import { en, NS, zh } from '../src/client/locales.ts'

/** The command contribution, as the real registry hands it back. */
interface Contribution {
  name: string
  label: () => string
  description: () => string
  available: () => boolean
  ui: { kind: string; run: () => void }
}

/**
 * Boot the browser half over the three services it declares, with fakes that
 * record the registrations and the tabs the command reveals.
 * @param mounted - what the right Sidebar answers to `isMounted()`.
 */
async function bench(mounted = true): Promise<{
  ctx: Context
  fiber: ReturnType<Context['plugin']>
  contributions: Contribution[]
  opened: string[]
}> {
  const contributions: Contribution[] = []
  const opened: string[] = []
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
  ctx.provide('sidebarRight', {
    isMounted: () => mounted,
    openTab: (kind: string) => { opened.push(kind) },
  } as never)
  const fiber = ctx.plugin({ inject: [...inject], apply })
  await fiber.await()
  return { ctx, fiber, contributions, opened }
}

describe('code-review pack browser half', () => {
  it('declares the services it binds', () => {
    expect(inject).toEqual(['commandUi', 'locale', 'sidebarRight'])
  })

  it('registers /review, which reveals the pinned review page', async () => {
    const { fiber, contributions, opened } = await bench()
    expect(contributions).toHaveLength(1)
    expect(contributions[0]?.name).toBe(REVIEW_COMMAND)
    expect(contributions[0]?.ui.kind).toBe('action')
    contributions[0]?.ui.run()
    expect(opened).toEqual(['changes'])
    await fiber.dispose()
    expect(contributions).toEqual([])
  })

  it('offers the command only while the right Sidebar is mounted', async () => {
    const absent = await bench(false)
    expect(absent.contributions[0]?.available()).toBe(false)
    await absent.fiber.dispose()
    const present = await bench(true)
    expect(present.contributions[0]?.available()).toBe(true)
    await present.fiber.dispose()
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
