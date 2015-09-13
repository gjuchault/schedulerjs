# scheduler.js

A wrapper around Promise to control the execution flow

## License

Released under MIT License

## Tests

Install mocha : `npm install -g mocha`
Start tests with : `npm test`

## Sequence

Sequence will execute Promises in serie

Example :

```js
let seq = new Sequence();

seq
    .next(() => {
        return promise;
    })
    .delay(500)
    .next(() => {
        return new Promise((resolve, reject) => {
            resolve();
        });
    })
    .start();

seq.on('started', () => {
    console.log('Sequence started');
});

seq.on('next', (pos, total) => {
    console.log(`${pos} / ${total}`);
});

seq.on('error', err => {
    console.log(`A promise rejected with ${err}`);
});

seq.on('stopped', () => {
    console.log('Sequence stopped');
});

seq.on('finished', () => {
    console.log('Sequence finished');
});
```

### API

* `constructor()` initializes the sequence
* `next(Function callback) → Sequence` adds a function to the queue
* `delay(Number number) → Sequence` adds a timeout function to the queue
* `stop()` stops the sequence
* `start()` starts the sequence

### Events

* `error(Object err)` triggered when a Promise rejected
* `finished()` triggered when all the Promise were finished
* `next(Number position, Number total)` triggered when one promise finished.
* `started` triggered when the sequence was started
* `stopped` triggered when the sequence was stopped

## Scheduler

Scheduler will execute Sequences in parallel

Example :

```js
let scheduler = new Scheduler();

let seq1 = new Sequence();
let seq2 = new Sequence();

seq1
    .next(...)
    .delay(500)
    .next(...);

seq2
    .next(...)
    .next(...);

scheduler
    .add(seq1)
    .set('othername', seq2) // sets scheduler.othername to seq2
    .start();

```

### API

* `constructor()` initializes the scheduler
* `add(Sequence seq) → Scheduler` adds a sequence to the parallel queue
* `set(String name, Sequence seq) → Scheduler` same as add, but sets the reference inside the scheduler
* `start()` starts all the sequences
* `stop()` stops all the sequences

### Events

* `error(Object err)` triggered when one sequence triggered `error`
* `started` triggered when the scheduler was started
* `finished` triggered when all the sequences triggered `finished`
* `stopped` triggered when the scheduler was stopped
