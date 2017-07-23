import {Queue, UniqueQueue, NotUniqueError, Order} from './queue'
import {timeout} from './index'

describe('Queue', () => {
  it('shoud execute jobs in order', async () => {
    const queue = new Queue()
    let index = 0

    const tasks = [
      queue.add(() => {
        expect(index).toBe(0)
        index += 1
        return Promise.resolve()
      }),
      queue.add(() => {
        expect(index).toBe(1)
        index += 1
        return Promise.resolve()
      }),
      queue.add(() => {
        expect(index).toBe(2)
        index += 1
        return Promise.resolve()
      }),
    ]

    await Promise.all(tasks)

    expect.assertions(3)
  })

  it('shoud return the value of the jobs', async () => {
    const queue = new Queue()

    expect(await queue.add(() => Promise.resolve(1))).toBe(1)
    expect(await queue.add(() => Promise.resolve(2))).toBe(2)
  })

  it('shoud handle rejections', async () => {
    const queue = new Queue()
    let index = 0

    const tasks = [
      expect(
        queue.add(() => {
          expect(index).toBe(0)
          index += 1
          return Promise.resolve(1)
        }),
      ).resolves.toBe(1),
      expect(
        queue.add(() => {
          expect(index).toBe(1)
          index += 1
          return Promise.reject('error from 2')
        }),
      ).rejects.toBe('error from 2'),
      expect(
        queue.add(() => {
          expect(index).toBe(2)
          index += 1
          return Promise.resolve(3)
        }),
      ).resolves.toBe(3),
    ]

    await Promise.all(tasks)

    expect.assertions(6)
  })
})

describe('UniqueQueue', () => {
  it('shoud execute jobs in order', async () => {
    const queue = new UniqueQueue()
    let index = 0

    const tasks = [
      queue.add(() => {
        expect(index).toBe(0)
        index += 1
        return Promise.resolve()
      }),
      queue.add(() => {
        expect(index).toBe(1)
        index += 1
        return Promise.resolve()
      }),
      queue.add(() => {
        expect(index).toBe(2)
        index += 1
        return Promise.resolve()
      }),
    ]

    await Promise.all(tasks)

    expect.assertions(3)
  })

  it('shoud return the value of the jobs', async () => {
    const queue = new UniqueQueue()

    expect(await queue.add(() => Promise.resolve(1))).toBe(1)
    expect(await queue.add(() => Promise.resolve(2))).toBe(2)
  })

  it('shoud handle rejections', async () => {
    const queue = new UniqueQueue()
    let index = 0

    const tasks = [
      expect(
        queue.add(() => {
          expect(index).toBe(0)
          index += 1
          return Promise.resolve(1)
        }),
      ).resolves.toBe(1),
      expect(
        queue.add(() => {
          expect(index).toBe(1)
          index += 1
          return Promise.reject('error from 2')
        }),
      ).rejects.toBe('error from 2'),
      expect(
        queue.add(() => {
          expect(index).toBe(2)
          index += 1
          return Promise.resolve(3)
        }),
      ).resolves.toBe(3),
    ]

    await Promise.all(tasks)

    expect.assertions(6)
  })

  it('shoud reject duplicaties', async () => {
    const queue = new UniqueQueue()
    let index = 0

    const tasks = [
      expect(
        queue.add(() => {
          expect(index).toBe(0)
          index += 1
          return Promise.resolve(1)
        }, 'one'),
      ).resolves.toBe(1),
      expect(
        queue.add(async () => {
          expect(index).toBe(1)
          index += 1
          return Promise.resolve(2)
        }, 'two'),
      ).resolves.toBe(2),
      expect(
        queue.add(() => {
          expect(index).toBe(2)
          index += 1
          return Promise.resolve(2)
        }, 'two'),
      ).rejects.toBeInstanceOf(NotUniqueError),
      expect(
        queue.add(() => {
          expect(index).toBe(2)
          index += 1
          return Promise.resolve(3)
        }, 'three'),
      ).resolves.toBe(3),
    ]

    await Promise.all(tasks)

    expect.assertions(7)
  })

  it('shoud respect the keep property', async () => {
    const queue = new UniqueQueue({keep: Order.last})
    let index = 0

    const tasks = [
      expect(
        queue.add(async () => {
          expect(index).toBe(0)
          index += 1
          await timeout(20)
          return Promise.resolve(1)
        }, 'one'),
      ).resolves.toBe(1),
      expect(
        queue.add(async () => {
          expect(index).toBe(1)
          index += 1
          return Promise.resolve(2)
        }, 'two'),
      ).rejects.toBeInstanceOf(NotUniqueError),
      expect(
        queue.add(() => {
          expect(index).toBe(1)
          index += 1
          return Promise.resolve(2)
        }, 'two'),
      ).resolves.toBe(2),
      expect(
        queue.add(() => {
          expect(index).toBe(2)
          index += 1
          return Promise.resolve(3)
        }, 'three'),
      ).resolves.toBe(3),
    ]

    await Promise.all(tasks)

    expect.assertions(7)
  })

  it('shoud handle started task with keep == last', async () => {
    const queue = new UniqueQueue({keep: Order.last})

    const task = queue.add(() => timeout(10).then(() => 'first'), 'unique')

    await expect(
      queue.add(() => timeout(10).then(() => 'second'), 'unique'),
    ).rejects.toBeInstanceOf(NotUniqueError)

    await expect(task).resolves.toBe('first')
  })
})
