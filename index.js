const UNLOCKED = 0,
  LOCKED_NO_WAITERS = 1,
  LOCKED_MAYBE_WAITERS = 2

module.exports = class Lock {
  constructor(
    iab = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT))
  ) {
    this.iab = iab
  }

  lock() {
    let result
    if (
      (result = Atomics.compareExchange(
        this.iab,
        0,
        UNLOCKED,
        LOCKED_NO_WAITERS
      )) !== UNLOCKED
    ) {
      if (result !== LOCKED_MAYBE_WAITERS)
        result = Atomics.exchange(this.iab, 0, LOCKED_MAYBE_WAITERS)
      while (result !== UNLOCKED) {
        Atomics.wait(this.iab, 0, LOCKED_MAYBE_WAITERS)
        result = Atomics.exchange(this.iab, 0, LOCKED_MAYBE_WAITERS)
      }
    }
  }

  unlock() {
    if (Atomics.sub(this.iab, 0, 1) !== LOCKED_NO_WAITERS) {
      this.iab[0] = UNLOCKED
      Atomics.notify(this.iab, 0, 1)
    }
  }
}