/**
 * Node half: the pack contributes the review workflow as a runtime Skill, the
 * contribution is released with the plugin's fiber, and a Host without a Skill
 * registry gets no contribution rather than a failed row.
 */

import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import { apply, name } from '../src/index.ts'
import { CODE_REVIEW_SKILL, CODE_REVIEW_SKILL_DESCRIPTION, CODE_REVIEW_SKILL_NAME } from '../src/skill.ts'

/** What `ctx.skills.register()` receives, as this pack uses it. */
interface Registration {
  name: string
  description: string
  source: string
  content: string
}

/** A Skill registry that records registrations and honours their disposers. */
function skillsStub(registrations: Registration[]): { register: (skill: Registration) => () => void } {
  return {
    register(skill) {
      registrations.push(skill)
      return () => {
        const at = registrations.indexOf(skill)
        if (at >= 0) registrations.splice(at, 1)
      }
    },
  }
}

/** Mount the node half over a Host context, with or without a Skill registry. */
async function bench(withSkills: boolean): Promise<{
  ctx: Context
  fiber: ReturnType<Context['plugin']>
  registrations: Registration[]
}> {
  const registrations: Registration[] = []
  const ctx = new Context()
  if (withSkills) ctx.provide('skills', skillsStub(registrations) as never)
  const fiber = ctx.plugin({ apply })
  await fiber.await()
  return { ctx, fiber, registrations }
}

describe('code-review pack node half', () => {
  it('carries a stable plugin name', () => {
    expect(name).toBe('code-review-pack')
  })

  it('registers the review workflow as a runtime Skill, and the fiber releases it', async () => {
    const { fiber, registrations } = await bench(true)
    expect(registrations).toEqual([{
      name: CODE_REVIEW_SKILL_NAME,
      description: CODE_REVIEW_SKILL_DESCRIPTION,
      source: 'runtime',
      content: CODE_REVIEW_SKILL,
    }])
    await fiber.dispose()
    expect(registrations).toEqual([])
  })

  it('contributes nothing when the Host carries no Skill registry', async () => {
    const { ctx, registrations } = await bench(false)
    expect(ctx.get('skills')).toBeUndefined()
    expect(registrations).toEqual([])
  })

  it('teaches that a rejected chunk is gone and must not be re-applied', () => {
    expect(CODE_REVIEW_SKILL).toContain('Do not re-apply a rejected change')
    expect(CODE_REVIEW_SKILL).toContain('Re-read the file before')
  })

  it('names the page, the shortcut, and the chunk unit it describes', () => {
    expect(CODE_REVIEW_SKILL).toContain('Changes')
    expect(CODE_REVIEW_SKILL).toContain('/review')
    expect(CODE_REVIEW_SKILL).toContain('git add -i')
  })
})
