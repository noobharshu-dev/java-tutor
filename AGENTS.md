# GIT WORKFLOW: follow this automatically, without me reminding you

ROLE: <<< FRONTEND >>>
- BACKEND owns: /app/api, /lib, /data. Never edit /app pages or /components.
- FRONTEND owns: /app (except /app/api) and /components. Never edit /app/api, /lib, /data.
- /lib/types.ts is the shared contract. NEVER change it on your own. If a change seems needed, stop and ask me first.

We work directly on the `main` branch. No feature branches, no pull requests.

## Before starting any task
1. Run `git status`. If there are uncommitted changes, commit them first.
2. Run `git pull --rebase origin main`.
3. If `package.json` or `package-lock.json` changed in the pull, run `npm install`.
4. Then start the task.

## After finishing any task (and only when it works)
1. Make sure the app builds/runs without errors (`npm run dev` starts, no TypeScript errors).
2. `git add -A`
3. `git commit -m "<short, clear message about what changed>"`
4. `git pull --rebase origin main`
5. `git push origin main`
6. Tell me in one line what you pushed, so I can message my teammate.

## If you install a new npm package
Commit and push `package.json` + `package-lock.json` immediately, and tell me so my teammate can pull and run `npm install`.

## Merge conflicts
- `package-lock.json`: keep either side, run `npm install`, commit.
- `types.ts` or any file you don't own: STOP, show me the conflict, and ask me. Do not guess.
- Your own files: resolve by keeping both sides' changes, then show me a summary of what you did.

## Hard rules
- NEVER use `git push --force`, `git reset --hard`, `git checkout .`, or `git clean -fd`.
- NEVER delete or overwrite files my teammate owns.
- NEVER commit `.env.local`, `node_modules`, `.next`, or `data/store.json`. Make sure they are in `.gitignore`.
- If the app breaks after a pull, run `git log -5` to see what came in, and fix it or tell me. Do not revert my teammate's work.
- After 4:30 on the clock (feature freeze), only fix bugs. Do not add features or refactor.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
