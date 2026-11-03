<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
# Nexus Vyoma — Project Rules

> **MANDATORY: Read this whole file at the start of EVERY prompt, even if the user does not mention it.**
> `CLAUDE.md` points here, so this is the single source of truth. Edit rules here only.

**Project:** Nexus Vyoma registration site, a three-day inter-college fest by ISL Engineering College, Hyderabad (10–12 Nov 2026).

## Rule 1 — Next.js rendering: SSR first, CSR only when needed

- Default to **Server Components** (SSR). Pages, layouts, data fetching and static content stay on the server.
- Add `"use client"` **only** for components that need browser APIs or interactivity: `window`, `document`, `localStorage`, GSAP/Framer Motion, event handlers, `useState`/`useEffect`, form interactivity, the payment checkout widget.
- Keep client components **small and leaf-level**, in `components/`. A server page composes them. Never mark a whole page as client just for one animation.
- Pass data from server to client through props. Don't fetch in `useEffect` when a server component can do it.
- Use Server Actions or Route Handlers (`app/api/**`) for mutations. Validate on the server.
- Before using any Next.js API, check `node_modules/next/dist/docs/` (see the block above).

## Rule 2 — Plan first, build after approval

- For **every task**, write an **implementation plan first** and wait for explicit user approval. Don't write project code before approval.
- The plan should state: goal, files to create or change, SSR/CSR split, animation approach, security impact and open questions.
- Exception: tiny edits the user explicitly asks to "just do" (typos, one-line fixes).
- After approval, implement, verify (lint/build/browser check) and report.

## Order of work for every prompt

1. Read this file (`AGENTS.md`) plus the Next.js docs and relevant skills.
2. Write the implementation plan, then **wait for approval**.
3. Verify (lint, build, responsive and motion check, asset audit).


<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
