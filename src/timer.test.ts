import {timeout} from './timer'

describe('timeout', () => {
  it('should set a timeout of the specified time', async () => {
    global.setTimeout = jest.fn()

    const promise = timeout(1000)

    expect((global.setTimeout as jest.Mock<any>).mock.calls[0][1]).toBe(1000)
    const expectPromise = expect(promise).resolves.toBe(undefined)
    ;(global.setTimeout as jest.Mock<any>).mock.calls[0][0]()
    await expectPromise
  })
})
