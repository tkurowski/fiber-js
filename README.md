# fiber-js
Fiber - a too simple replacement for Worker

## Example 1: a series of heavy tasks

    var tasks = [task0, task1, ...]; // an array of heavy tasks
  
    var fiber = new Fiber().task(function (i) {
        return tasks[i];
    }).resolve(function (task, i, taskdone) {
        // the heavy task is being done here...
        // task.resolve();
        taskdone(); // notify the fiber that it can move to the next task
    }).done(function (count) {
        // all tasks are done!!
        alert("Hurray! All " + count + " tasks are done!");
    }).run();

## Example 2: a long series in batches

    var myTask = {
       subtasks: [task0, task1, ...], // a *looong* series of light tasks
       BATCHSIZE: 100
    };
    var BATCHSIZE = 100;
    
    // task, resolve and done will have myTask as 'this'
    var fiber = new Fiber(myTask).task(function (i) {
        var nexttask = i * this.BATCHSIZE;
        return nexttask < this.subtasks.length ? nexttask : null;
    }).resolve(function (nexttask, _, batchdone) {
        var limit = Math.min(this.subtasks.length, nexttask + this.BATCHSIZE);
        for (var i = nexttask; i < limit; i++) {
            this.subtasks[i].resolve();
        }
        batchdone(); // batch complete
    }).done(function () {
        alert("done");
    }).run();

## Example 3: fibers in fiber ( not nice ;( )

    var fiber = new Fiber(myObject).task(function (i) {
        return this.task(i);
    }).resolve(function (task, _i, taskdone) {
        new Fiber().task(function (j) {
            return task.subtask(j);   
        }).resolve(function (subtask, _j, subtaskdone) {
            subtask.resolve();
            subtaskdone();
        }).done(function () {
            taskdone(); // task 'i' is done
        }).run();
    }).done(function () {
        alert("all done");
    }).run();
