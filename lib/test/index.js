'use strict';

/* globals describe, it */

let assert    = require('assert');
let Scheduler = require('../scheduler');
let Sequence  = require('../sequence');

describe('scheduler.js', () => {
    describe('Scheduler', () => {
        it('should be an event emitter', done => {
            let sch = new Scheduler();

            sch.on('foo', done);
            sch.emit('foo');
        });

        it('should create a scheduler', done => {
            let sch = new Scheduler();

            sch.start();

            sch.on('finished', done);
        });

        it('should add sequences to the scheduler', done => {
            let sch  = new Scheduler();
            let seq1 = new Sequence();
            let seq2 = new Sequence();

            sch
                .add(seq1)
                .add(seq2)
                .start();

            sch.on('finished', done);
        });

        it('should be able to use named sequences', done => {
            let sch = new Scheduler();
            let seq = new Sequence();

            sch
                .set('seq', seq);

            sch.seq.start();

            seq.on('finished', done);
        });

        it('should wait for all the sequences', done => {
            let sch  = new Scheduler();
            let seq1 = new Sequence();
            let seq2 = new Sequence();

            seq1.delay(100);
            seq2.delay(300);

            sch
                .add(seq1)
                .set('seq2', seq2)
                .start();

            sch.on('finished', done);
        });

        it('should stop globally', done => {
            let sch  = new Scheduler();
            let seq1 = new Sequence();
            let seq2 = new Sequence();

            seq1.delay(100);
            seq2.delay(300);

            sch
                .add(seq1)
                .set('seq2', seq2)
                .start();

            setTimeout(() => {
                sch.stop();
            }, 70);

            sch.on('stopped', done);
        });

        it('should throw errors', done => {
            let sch = new Scheduler();
            let seq = new Sequence();

            seq
                .delay(50)
                .next(() => {
                    return new Promise((resolve, reject) => {
                        reject('foo');
                    });
                });

            sch
                .add(seq)
                .start();

            sch.on('error', err => {
                assert.equal(err, 'foo');
                done();
            });
        });
    });

    describe('Sequences', () => {
        it('should be an event emitter', done => {
            let seq = new Sequence();

            seq.on('foo', done);
            seq.emit('foo');
        });

        it('should create some sequences', done => {
            let seq = new Sequence();

            seq.start();

            seq.on('finished', done);
        });

        it('should be able to delay sequences', done => {
            let seq = new Sequence();

            seq
                .delay(50)
                .delay(50)
                .start();

            seq.on('finished', done);
        });

        it('should be able to stop sequences', done => {
            let seq = new Sequence();

            seq
                .delay(100)
                .start();

            setTimeout(() => {
                seq.stop();
            }, 50);

            seq.on('stopped', done);
        });

        it('should be able to handle classic promise', done => {
            let seq = new Sequence();

            seq
                .delay(50)
                .next(() => {
                    return new Promise(resolve => {
                        resolve();
                    });
                })
                .start();

            seq.on('finished', done);
        })

        it('should throw errors', done => {
            let seq = new Sequence();

            seq
                .delay(50)
                .next(() => {
                    return new Promise((resolve, reject) => {
                        reject('foo');
                    });
                })
                .start();

            seq.on('error', reason => {
                assert.equal('foo', reason);
                done();
            });
        });
    });
});
