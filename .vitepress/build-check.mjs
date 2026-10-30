import { mkdtemp, symlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { build } from 'vitepress'
import { build as bundle } from 'esbuild'

const root = process.cwd()
const directory = await mkdtemp(path.join(tmpdir(), '52codex-check-'))
// SSR resolves Vue from this parent without installing or changing dependencies.
await symlink(path.join(root, 'node_modules'), path.join(directory, 'node_modules'), 'dir')
await build(root, {
  outDir: path.join(directory, 'dist'),
  onAfterConfigResolve(config) {
    config.cacheDir = path.join(directory, 'cache')
    config.tempDir = path.join(directory, 'server')
  }
})
const verification = await promisify(execFile)(process.execPath, ['.vitepress/verify-build.mjs', path.join(directory, 'dist')])
process.stdout.write(verification.stdout)
await bundle({ entryPoints: ['functions/api/comments.js', 'functions/api/comments-admin.js', 'functions/api/codex-resets.js', 'functions/api/hot-posts.js'],
  bundle: true, format: 'esm', platform: 'browser', outdir: path.join(directory, 'functions'), logLevel: 'info' })
console.log(`检查产物：${directory}`)
