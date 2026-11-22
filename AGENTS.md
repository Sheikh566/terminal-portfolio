# AGENTS.md

Terminal-style personal portfolio ("SheikhOS"). A single page where visitors type commands (`help`, `about`, `projects`, `dino`, ...) and get text output. Built with SvelteKit 3 + Svelte 5 and deployed to Cloudflare Workers.

## Commands

Package manager is **Yarn 4** (pinned via `packageManager`). If `yarn` isn't on PATH, use `npx corepack yarn <cmd>`.

| Task | Command |
| --- | --- |
| Install | `yarn install` |
| Dev server | `yarn dev` |
| Type check | `yarn check` |
| Tests | `yarn test` (Vitest, `src/**/*.test.ts`) |
| Build | `yarn build` |
| Deploy | `yarn build && npx wrangler deploy` |

Before you finish a change, run `yarn check`, `yarn test` and `yarn build`. All three must pass.

## Layout

- `src/routes/+page.svelte`: the terminal UI. It holds the command history, the input, and the dino game loop.
- `src/routes/+layout.ts` / `+layout.svelte`: SEO/Open Graph meta. `prerender = true`, so the whole site is static HTML.
- `src/lib/terminal.ts`: `runCommand()` maps input to a `CommandResult`. `formatOutput()` escapes output and linkifies URLs before it's rendered with `{@html}`.
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

## Adding a command

1. Create `src/lib/<name>.ts` exporting a function that returns a string.
2. Register it in `textCommands` in `src/lib/terminal.ts`.
3. Add it to `src/lib/commands.json` so `help` lists it. A test fails if a listed command isn't handled.

## Deployment notes

- `@sveltejs/adapter-cloudflare` v9 writes `.svelte-kit/cloudflare/{worker,client}` plus a generated `wrangler.json`, and points `.wrangler/deploy/config.json` at it. Deploy with `npx wrangler deploy` from the repo root. There is no checked-in wrangler config.
- **Why Wrangler, not the `cf` CLI:** as of `cf` 1.0.0-rc.2, `cf init`/`cf deploy` stop with "cf does not support SvelteKit projects yet". Keep deploying with Wrangler until `cf` supports SvelteKit. Don't add `cloudflare.config.ts` or run `cf build`/`cf deploy` here. `cf` resource commands (DNS, zones) are fine to use.
- `paths.origin` in `vite.config.ts` (`https://sabdullah.com`) is used for canonical and OG URLs in the prerendered HTML. Update it if the domain changes.
