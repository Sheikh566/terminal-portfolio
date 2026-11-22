# AGENTS.md

Terminal-style personal portfolio ("SheikhOS"). A single page where visitors type commands (`help`, `about`, `projects`, `dino`, ...) and get text output. Built with SvelteKit 3 + Svelte 5 and deployed to Cloudflare Pages.

## Commands

Package manager is **Yarn 4** (pinned via `packageManager`). If `yarn` isn't on PATH, use `npx corepack yarn <cmd>`.

| Task | Command |
| --- | --- |
| Install | `yarn install` |
| Dev server | `yarn dev` |
| Type check | `yarn check` |
| Tests | `yarn test` (Vitest, `src/**/*.test.ts`) |
| Build | `yarn build` |
| Deploy | Push to `master`. The Cloudflare Pages Git integration builds and deploys it. |

Before you finish a change, run `yarn check`, `yarn test` and `yarn build`. All three must pass.

## Layout

- `src/routes/+page.svelte`: the terminal UI. It holds the command history, the input, and the dino game loop.
- `src/routes/+layout.ts` / `+layout.svelte`: SEO/Open Graph meta. `prerender = true`, so the whole site is static HTML.
- `src/lib/terminal.ts`: `runCommand()` maps input to a `CommandResult`. `formatOutput()` escapes output and linkifies URLs before it's rendered with `{@html}`.
- `src/lib/completion.ts`: command autocompletion. It shows a dimmed suggestion while typing (→ or a tap accepts it) and does bash-style Tab completion. Command names come from `commands.json`, so new commands are completed automatically.
- `src/lib/<command>.ts`: one file per text command, each returning a plain string.
- `src/lib/commands.json`: the command list shown by `help`.
- `src/lib/games/dino-logic.ts`: the `DinoGame` state machine. Each `tick()` advances it one fixed step. The page drives timing (20 steps/s, fixed timestep).
- `src/lib/site-meta.ts`: title, description and OG image settings.

## Conventions

- **SvelteKit 3 config lives in `vite.config.ts`**: options go directly to `sveltekit({...})`. There is no `svelte.config.js`; don't add one, because kit 3 errors on it.
- **Use `#lib/...` imports with the file extension**, e.g. `import { x } from "#lib/foo.ts"`. `$lib` was removed in kit 3. `#lib` is defined in `package.json` `imports`.
- `tsconfig.json` extends `$app/tsconfig`, which `svelte-kit sync` generates.
- TypeScript stays on 6.x: kit 3 declares a peer dependency on `typescript ^6`.
- Svelte 5 runes (`$state`, `$props`), not legacy stores/`export let`.
- Command output is plain text inside a `white-space: pre` block. Line up columns with spaces, and keep lines short enough for the terminal width.

## Versioning: bump on every release

Every change that ships to users (content, features, fixes, dependency upgrades) must bump the SheikhOS version in the same commit. Use semver: patch for fixes and content tweaks, minor for new commands, sections or features, major for a redesign.

The version is hard-coded in three places. Change all three together:

1. `package.json`: `"version"`
2. `src/lib/help.ts`: the `Welcome to SheikhOS vX.Y.Z` banner
3. `src/lib/intro.ts`: `SheikhOS vX.Y.Z` on the intro screen. Keep the line's alignment: if the version string changes length, adjust the padding before it.

Check with `grep -rn "SheikhOS v\|\"version\"" src package.json`. All three must match.

## Adding a command

1. Create `src/lib/<name>.ts` exporting a function that returns a string.
2. Register it in `textCommands` in `src/lib/terminal.ts`.
3. Add it to `src/lib/commands.json` so `help` lists it. A test fails if a listed command isn't handled.

## Deployment notes

- **Cloudflare Pages, via `@sveltejs/adapter-static`.** `adapter-cloudflare` v9+ targets Workers only and does not support Pages. Using it broke the Pages build once (see the v1.3.1 commit). Don't switch back to `adapter-cloudflare` unless the project is also moved from Pages to Workers Builds.
- The site must stay fully prerendered (`prerender = true` in `src/routes/+layout.ts`). No server routes, form actions or `+server.ts` endpoints: there is no server at runtime.
- The build writes to `.svelte-kit/cloudflare`, the Pages project's build output directory. Don't change `pages` in `vite.config.ts` without changing the Pages setting too.
- `static/_headers` sets Pages caching (hashed `/_app/immutable/*` files are cached for a year). `404.html` is generated as the not-found page.
- Before pushing a dependency or config change, simulate the Pages build from a clean clone: `yarn install --immutable && yarn build`, then check that `.svelte-kit/cloudflare/index.html` exists.
- **The `cf` CLI:** as of `cf` 1.0.0-rc.2, `cf init` stops with "cf does not support SvelteKit projects yet". Don't add `cloudflare.config.ts`. `cf` resource commands (DNS, zones) are fine to use.
- `paths.origin` in `vite.config.ts` (`https://sabdullah.com`) is used for canonical and OG URLs in the prerendered HTML. Update it if the domain changes.
