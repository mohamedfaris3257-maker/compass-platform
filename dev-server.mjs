#!/usr/bin/env node
// Wrapper that ensures Vite + Tailwind JIT run from the correct project root.
// Needed when the process working directory differs from the project directory
// (e.g. when launched via .claude/launch.json from a parent folder).
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const PROJECT_ROOT = dirname(fileURLToPath(import.meta.url))
process.chdir(PROJECT_ROOT)

const vite   = `${PROJECT_ROOT}/node_modules/.bin/vite`
const args   = process.argv.slice(2)   // forward any extra CLI args (e.g. 'preview')
const isWin  = process.platform === 'win32'

const result = spawnSync(
  process.execPath,           // /usr/local/bin/node
  [vite, '--host', ...args],
  {
    cwd:   PROJECT_ROOT,
    stdio: 'inherit',
    env:   { ...process.env, NODE_PATH: `${PROJECT_ROOT}/node_modules` },
    shell: isWin,
  }
)

process.exit(result.status ?? 0)
