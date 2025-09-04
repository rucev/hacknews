import { describe, it, expect } from 'vitest'
import { getDate } from '../../logic/index.ts'

describe('getDate', () => {
  it(`returns today's date in Spanish locale`, () => {
    const today = new Date()
    expect(getDate()).toBe(today.toLocaleDateString('es'))
  })
})
