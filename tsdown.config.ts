import { resolve } from 'node:path'

/**
 * Standalone build config.
 *
 * A dsh Client bundle is not an ordinary library build: it has to be emitted as
 * a closure factory that registers itself with the browser module loader and
 * resolves the packages it shares through the module table. That preset lives in
 * the `deepseek-harness` checkout (`packages/client/tsdown.client.ts`) and is not
 * published as a package, so this config resolves it from `DSH_CHECKOUT`
 * (default: a sibling `../deepseek-harness` directory).
 *
 * `pnpm run bundle` therefore needs two things: a checkout, and the compiled
 * `lib/types/**` for the Host half (`tsc -b` inside the checkout produces it).
 * See DEVELOPMENT.md.
 */
const checkout = resolve(process.env.DSH_CHECKOUT ?? '../deepseek-harness')
const { clientBundle } = await import(`${checkout.replaceAll('\\', '/')}/packages/client/tsdown.client.ts`)

export default clientBundle(
  '@moazzamak/dsh-code-review',
  ['lib/types/index.js'],
  { hostPhase: true },
)
