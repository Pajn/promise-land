export type Task<T = any> = {
  executor: () => Promise<T>
  resolve: (value: T) => void
  reject: (error: any) => void
}

/**
 * A queue that executes jobs in order
 */
export class Queue {
  protected tasks: Array<Task> = []
  protected isExecuting = false

  add<T>(executor: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this._add({executor, resolve, reject})
    })
  }

  protected _add<T>(task: Task<T>) {
    this.tasks.push(task)

    if (this.tasks.length === 1) {
      this._execute()
    }
  }

  private _execute() {
    if (!this.isExecuting) {
      this.isExecuting = true
      const job = this.tasks[0]
      if (job !== undefined) {
        job.executor().then(
          value => {
            this._executed()
            job.resolve(value)
          },
          error => {
            this._executed()
            job.reject(error)
          },
        )
      }
    }
  }

  private _executed() {
    this.tasks.shift()
    this.isExecuting = false
    if (this.tasks.length > 0) {
      this._schedule()
    }
  }

  private _schedule() {
    setImmediate(() => {
      this._execute()
    })
  }
}

export enum Order {
  first = 'first',
  last = 'last',
}

export class NotUniqueError extends Error {
  message = 'NotUniqueError'
}

/**
 * A unique version of the queue. Each job may have a key that when specified
 * mus be unique in the queue. When a conflict is detected will, depending on
 * the keep property, the first or the last queued job with the same key be
 * rejected with a NotUniqueError.
 */
export class UniqueQueue extends Queue {
  keep: Order

  protected tasks: Array<
    Task & {
      uniqueKey?: string
    }
  > = []

  constructor({keep = Order.first} = {}) {
    super()
    this.keep = keep
  }

  add<T>(executor: () => Promise<T>, uniqueKey?: string): Promise<T> {
    if (uniqueKey !== undefined) {
      const index = this.tasks.findIndex(task => task.uniqueKey === uniqueKey)
      if (index >= 0) {
        if (this.keep === Order.first) {
          return Promise.reject(new NotUniqueError())
        } else if (index === 0 && this.isExecuting) {
          return Promise.reject(new NotUniqueError())
        } else {
          const conflicting = this.tasks[index]
          this.tasks.splice(index, 1)
          conflicting.reject(new NotUniqueError())
        }
      }
    }

    return new Promise((resolve, reject) => {
      this._add({executor, resolve, reject, uniqueKey} as Task)
    })
  }
}
