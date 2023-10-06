import { pr, spawn } from './utils.mjs'

spawn('pnpm', [
  'exec',
  [
    'plasmo',
    'dev',
    '--verbose',
    '--src-path',
    `"${pr('./ext/cs')}"`,
    '--build-path',
    `"${pr('./ext/dist/cs')}"`,
  ].join(' '),
])
