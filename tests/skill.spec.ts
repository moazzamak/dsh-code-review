/**
 * Node half: the pack contributes the review workflow as a runtime Skill, the
 * contribution is released with the plugin's fiber, and a Host without a Skill
 * registry gets no contribution rather than a failed row.
 */

import { Context } from '@deepseek-ai/cordis'
import { describe, expect, it } from 'vitest'
import { apply, name } from '../src/index.ts'
import { CODE_REVIEW_SKILL, CODE_REVIEW_SKILL_DESCRIPTION, CODE_REVIEW_SKILL_NAME } from '../src/skill.ts'

/**
 * The Skill body with its line wrapping collapsed.
 *
 * The body is prose wrapped at eighty columns, so a phrase a test cares about
 * can straddle a line break. Reading the sentence rather than the file keeps
 * these assertions about what the Skill teaches instead of where it wraps.
 */
const BODY = CODE_REVIEW_SKILL.replace(/\s+/g, ' ')

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

  it('teaches that this build reverts nothing behind the agent\'s back', () => {
    expect(BODY).toContain('no keep/reject step')
    expect(BODY).toContain('Nothing is reverted behind your back')
    expect(BODY).toContain('the change is still in the file')
  })

  it('does not promise the keep/reject contract this build removed', () => {
    // dsh 0.1.5 reverted a rejected chunk and reported it back to the model.
    // 0.2 removed that surface, so an agent told to expect it would wait for a
    // note that never arrives and would distrust its own edits.
    for (const removed of ['Keep / Reject', 'Reject', 'rejected chunk', 'git add -i']) {
      expect(BODY).not.toContain(removed)
    }
  })

  it('names the review surface it describes, and the unit the User reviews', () => {
    expect(BODY).toContain('/review')
    expect(BODY).toContain('in the right sidebar')
    expect(BODY).toContain('One coherent change per turn')
    expect(BODY).toContain('The turn is the unit the User reviews, not the tool call')
  })

  it('warns that a subagent\'s edits never reach the User\'s diff', () => {
    expect(BODY).toContain('A subagent\'s edits are never part of the User\'s per-turn diff')
    expect(BODY).toContain('your own message has to carry')
  })

  it('states what the record leaves out, which no tool result can carry', () => {
    expect(BODY).toContain('In a working directory with no git repository, only file-tool edits are listed')
    expect(BODY).toContain('A Session reopened after a Host restart has no comparison for its earlier turns')
  })
})
