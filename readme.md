# atomic-lock

## Installation
```
npm install atomic-lock
```

## Description
1. Create a one-element int32 SharedArrayBuffer for the lock to use
2. Share that SharedArrayBuffer via workerData with your nodejs worker threads
3. Create atomic-lock instances with that SharedArrayBuffer in each worker thread
4. Lock your critical section
5. Unlock when finished

- https://github.com/featurerich1/atomic-lock
- This is a JavaScript rendition of the v3 Mutex from "Futexes Are Tricky" by Ulrich Drepper https://akkadia.org/drepper/futex.pdf

## Example
```js
const { Worker, workerData } = require("worker_threads")
const numThreads = 8
const sab = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT))
const result = new Int32Array(
  new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT)
)
let doneCount = 0
for (let i = 0; i < numThreads; i++) {
  const worker = new Worker(
    `
        const { workerData } = require('worker_threads')
        const { sab, result } = workerData
        const Lock = require('atomic-lock')
        const lock = new Lock(sab)
        for(let i = 0; i < 1_000_000; i++) {
            lock.lock()
            result[0] += 1
            lock.unlock()
        }
        `,
    { eval: true, workerData: { sab, result } }
  )
  worker.on("exit", (code) => {
    doneCount++
    if (doneCount === numThreads) {
      console.log(result) // 8,000,000
    }
  })
}
```


