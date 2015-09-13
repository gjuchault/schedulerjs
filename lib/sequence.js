'use strict';

let EventEmitter = require('events');

/**
 * Sequential promises
 */
class Sequence extends EventEmitter {
    /**
     * Initializes the object
     * @return {Sequence} The Sequence object
     */
    constructor () {
        super();

        this.started = false;
        this.queue   = [];
        this.pos     = 0;
    }

    /**
     * Adds a function to the queue
     * @param  {Function} callback A function returning a promise
     * @return {Function} This object (chaining)
     */
    next (callback) {
        this.queue.push(callback);

        return this;
    }

    /**
     * Adds a delay function to the queue
     * @param  {Number} promise The timeout amount
     * @return {Function} This object (chaining)
     */
    delay (number) {
        let timeoutPromise = () => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                }, number);
            });
        };

        return this.next(timeoutPromise);
    }

    /**
     * Stops the sequence after the next test is done
     */
    stop () {
        this.stopped = true;
        this.emit('stopped');
    }

    /**
     * Starts the queue
     */
    start () {
        // use nextTick to allow events after start
        process.nextTick(() => {
            if (!this.started) {
                this.started = true;
                this.emit('started');
            } else {
                this.emit('next', this.pos, this.queue.length);
            }

            if (this.queue.length - this.pos === 0) {
                this.emit('finished');
                return;
            }

            this.queue[this.pos]()
                .then(() => {
                    this._callNext();
                })
                .catch(reason => {
                    this.emit('error', reason);
                });
        });
    }

    /**
     * Call the next on the queue, or not if stopped
     * @private
     */
    _callNext () {
        if (this.stopped) {
            return;
        }

        ++this.pos;
        this.start();
    }
}

module.exports = Sequence;
