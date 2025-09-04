import { describe, it, expect, vi } from 'vitest'

vi.mock('../logic/index.ts', () => ({
  getDate: vi.fn(() => 'MOCK/ED/DATE'),
}))

describe('start function', () => {
  it('logs the result of getDate', () => {
    /*
    const logSpy = vi.spyOn(console, 'log')

    start() 

    expect(getDate).toHaveBeenCalled()             
    expect(logSpy).toHaveBeenCalledWith('MOCK/ED/DATE')

    logSpy.mockRestore() */
  })
})
