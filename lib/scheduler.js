'use strict';

let EventEmitter = require('events');

/**
 * Scheduler class. Starts Sequences in parallel
 */
class Scheduler extends EventEmitter {
    /**
     * Initializes the object
     */
    constructor () {
        super();

        this.sequences     = [];
        this.sequencesDone = 0;
    }

    /**
     * Adds a sequence
     * @param  {Sequence} sequence The sequence to add
     * @return {Scheduler} This object (chaining)
     */
    add (sequence) {
        this.sequences.push(sequence);

        sequence.on('error', reason => {
            this.emit('error', reason);
        });

        sequence.on('finished', () => {
            this._checkFinished();
        });

        return this;
    }

    /**
     * Adds a named sequence
     * @param  {String} sequenceName The sequence name
     * @param  {Sequence} sequence   The sequence to add
     * @return {Scheduler} This object (chaining)
     */
    set (sequenceName, sequence) {
        this.add(sequence);
        this[sequenceName] = sequence;
        return this;
    }

    /**
     * Starts all the sequences
     */
    start () {
        // use nextTick to allow events after start
        process.nextTick(() => {
            this.emit('started');

            if (this.sequences.length === 0) {
                this.emit('finished');
            }

            this.sequences.forEach(sequence => {
                sequence.start();
            });
        });
    }

    /**
     * Stops all the sequences
     */
    stop () {
        process.nextTick(() => {
            this.sequences.forEach(sequence => {
                sequence.stop();
            });

            this.emit('stopped');
        });
    }

    /**
     * Checks wether all the sequences are completed or nto
     * @private
     */
    _checkFinished () {
        ++this.sequencesDone;

        if (this.sequencesDone === this.sequences.length) {
            // ensure scheduler finish after all sequences
            process.nextTick(() => {
                this.emit('finished');
            });
        }
    }
}

module.exports = Scheduler;
