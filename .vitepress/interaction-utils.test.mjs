import { test } from 'node:test'
import assert from 'node:assert/strict'
import { copyText, navigationIndex } from './theme/interaction-utils.mjs'

test('clipboard denial and unavailable API produce retryable feedback', async () => {
  assert.equal(await copyText('内容', { writeText: async () => { throw new Error('denied') } }), false)
  assert.equal(await copyText('内容', null), false)
  let copied
  assert.equal(await copyText('内容', { writeText: async value => { copied = value } }), true)
  assert.equal(copied, '内容')
})

test('keyboard navigation enters, wraps and reaches first or last links', () => {
  assert.equal(navigationIndex('ArrowDown', -1, 3), 0)
  assert.equal(navigationIndex('ArrowUp', -1, 3), 2)
  assert.equal(navigationIndex('ArrowDown', 2, 3), 0)
  assert.equal(navigationIndex('Home', 2, 3), 0)
  assert.equal(navigationIndex('End', 0, 3), 2)
  assert.equal(navigationIndex('Tab', 0, 3), null)
})
