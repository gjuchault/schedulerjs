import { EventEmitter } from 'events';

/**
 * Sequential promises
 */
class Sequence extends EventEmitter {
    /**
     * Initializes the object
     */
    constructor () {
        super();

        this.started = false;
        this.queue   = [];
        this.pos     = 0;
    }

    /**
     * Adds a function to the queue
     * @param  {Function|Sequence} callback A function returning a promise or another sequence
     * @return {Function} This object (chaining)
     */
    next (callback) {
        if (callback instanceof Sequence) {
            let otherSequenceToPush = callback.queue.slice(callback.pos);
            this.queue.push(...otherSequenceToPush);
        } else {
            this.queue.push(callback);
        }

        return this;
    }

    /**
     * Adds a delay function to the queue
     * @param  {Number} number The timeout amount
     * @return {Function} This object (chaining)
     */
    delay (number) {
        let timeoutPromise = () =>
            new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                }, number);
            });

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

export default Sequence;
