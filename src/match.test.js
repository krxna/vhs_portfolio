import { test } from 'node:test'
import assert from 'node:assert/strict'
import { matchTape } from './match.js'
import { TAPES } from './content.js'

const pick = t => TAPES[matchTape(t, TAPES)]?.label

test('matchTape', () => {
  assert.equal(pick('Show me Unsaid.'), 'UNSAID')
  assert.equal(pick('play psst'), 'PSST')
  assert.equal(pick('tell me about the game jam'), 'PSST')
  assert.equal(pick('show me leanstack'), 'SAVED')
  assert.equal(pick('play saved'), 'SAVED')
  assert.equal(pick('Ask the floor, please'), 'ASK THE FLOOR')
  assert.equal(pick('the inventry one'), 'ASK THE FLOOR')
  assert.equal(pick('Tell me why?'), 'TELL ME WHY?')
  assert.equal(pick('tell me about Krishna'), 'TELL ME WHY?')
  assert.equal(matchTape('why does this work', TAPES), -1)
  assert.equal(matchTape('I want to learn more', TAPES), -1)
  assert.equal(matchTape('hello there', TAPES), -1)
  assert.equal(matchTape('', TAPES), -1)
})
