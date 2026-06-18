# movietracker

A simple movie tracker (Node.js + TypeScript).

## Getting started

```bash
npm install      # install dependencies
npm run build    # type-check and compile to dist/
npm test         # run the test suite (Vitest)
npm run lint     # run ESLint
npm run format   # format with Prettier
```

## Project layout

- `src/movies.ts` — the `MovieTracker` module.
- `src/movies.test.ts` — tests for it.

## Claude Code on the web

This repo includes a `SessionStart` hook at
`.claude/hooks/session-start.sh` that runs `npm install` automatically when a
[Claude Code on the web](https://code.claude.com/docs/en/claude-code-on-the-web)
session starts, so dependencies are ready before Claude runs tests or linters.
The hook is registered in `.claude/settings.json` and only runs in remote web
sessions (it no-ops locally).
