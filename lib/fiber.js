/**
 * @class
 *
 * A Fiber runs a time consuming series of tasks in a 'semi-detached'
 * manner so as not to block the main thread. A too simple replace for
 * Workers
 *
 * Example:
 * 
 * var tasks = [task0, task1, ...]; // array of heavy tasks
 *
 * var fiber = new Fiber().task(function (i) {
 *     return tasks[i];
 * }).resolve(function (task, i, done) {
 *     // resolve the task here, and then...
 *     done();
 * }).done(function (count) {
 *    // all tasks are done!!
 *    alert("Hurray! All " + count " tasks are done!");
 * }).run();
 *
 * // ... in the meantime
 * fiber.abort(); // stop processing tasks
 *
 * @constructor
 * @param {Object} context 'this' context for task, resolve, done methods
 */
function Fiber(context) {
    this._context = context;
    this._task = null;
    this._resolve = null;
    this._done = null;

    this._to = 0;
}

Fiber.prototype = {
    /**
     * Set `[next]task` function.
     * The next task function (given here as argument) will be called
     * with task index and must return an object representing
     * the taks to be resolved or null/undefined if there are no tasks left
     * @param {Function} task
     * @return {Fiber} current fiber
     */
    task: function (task) {
        this._task = task;
        return this;
    },

    /**
     * Set `resolve[task]` function.
     * The resolve task function (given here as argument) will be called
     * with the task object (as returned by #task() function) and with a
     * callback function that must be called upon completing the task
     * @param {Function} resolve
     * @return {Fiber} current fiber
     */
    resolve: function (resolve) {
        this._resolve = resolve;
        return this;
    },

    /**
     * Set `done` handler.
     * @param {Function} done
     * @return {Fiber} current fiber
     */
    done: function (done) {
        this._done = done;
        return this;
    },

    /**
     * Runs the fiber
     * @return {Fiber} current fiber
     */
    run: function () {
        var i = 0;
        this._to = setTimeout(function next(self) {
            var task = self._task.call(self._context, i++);
            if (task == null) {
                self._done.call(self._context, /*tasksdone=*/i);
            }
            else 
                self._resolve.call(self._context, task, i, function () {
                    self._to = setTimeout(next, 50, self);
                });
        }, 50, this);

        return this;
    },

    /**
     * Aborts the fiber
     */
    abort: function () {
        clearInterval(this._to);
    }
};

