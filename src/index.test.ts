import * as index from './index'

describe('index', () => {
  it('should reexport the queues and timers', () => {
    expect(index.Queue).toBeInstanceOf(Function)
    expect(index.UniqueQueue).toBeInstanceOf(Function)
    expect(index.NotUniqueError).toBeInstanceOf(Function)
    expect(index.Order).toBeInstanceOf(Object)
    expect(index.timeout).toBeInstanceOf(Function)
  })
})
