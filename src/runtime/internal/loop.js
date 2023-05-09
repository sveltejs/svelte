import { raf } from './environment';
const tasks = new Set();
/** @param {number} now
 * @returns {void}
 */
function run_tasks(now) {
    tasks.forEach((task) => {
        if (!task.c(now)) {
            tasks.delete(task);
            task.f();
        }
    });
    if (tasks.size !== 0)
        raf(run_tasks);
}
/**
 * For testing purposes only!
 * @returns {void}
 */
export function clear_loops() {
    tasks.clear();
}
/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 * @param {TaskCallback} callback
 * @returns {import("/Users/elliottjohnson/dev/sveltejs/svelte/loop.ts-to-jsdoc").Task}
 */
export function loop(callback) {
    /** @type {TaskEntry} */
    let task;
    if (tasks.size === 0)
        raf(run_tasks);
    return {
        promise: new Promise((fulfill) => {
            tasks.add((task = { c: callback, f: fulfill }));
        }),
        abort() {
            tasks.delete(task);
        }
    };
}


/** @typedef {(now: number) => boolean | void} TaskCallback */
/** @typedef {{ c: TaskCallback; f: () => void }} TaskEntry */

/** @typedef {Object} Task
 * @property {Promise<void>} promise 
 */