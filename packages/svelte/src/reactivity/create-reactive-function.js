import { ReactiveValue } from "./reactive-value.js";

/**
 * @typedef {() => void} VoidFn
 */

/**
 * Used to synchronize external state with Svelte's reactivity system.
 * 
 * In order to synchronize external state, you need to know two things: 
 * - The value of the external state at a given time
 * - When you should update that value
 * 
 * These correspond to the two arguments to this function:
 * 
 * - {@link getSnapshot} is a function that returns the current value of the external state
 * - {@link onSubscribe} is a callback that sets up reactivity:
 *   - It is called the first time the function returned by {@link createReactiveFunction} becomes tracked by a dependent
 *   - It receives a function, `update`, as its first argument. Calling `update` tells Svelte that the value in the external
 *     store has changed, and it needs to push that change to all of its listeners
 *   - If it returns a cleanup function, that cleanup function will be called when the number of listeners to the reactive function
 *     returns to zero
 * 
 * Combined with `$derived.by`, this enables seamless integration with external data sources, including destructuring support:
 * 
 * @example
 * ```js
 * import { observer } from 'external-datafetching-library';
 * 
 * const { data, loading, refetch } = $derived.by(
 *   createReactiveFunction(
 *     observer.getCurrentResult,
 *     observer.subscribe
 *   )
 * );
 * ```
 * 
 * (For our React friends, this is a similar model to `useSyncExternalStore`.)
 * 
 * @template T
 * @param {() => T} getSnapshot
 * @param {(update: VoidFn) => void | VoidFn} onSubscribe
 * @returns {() => T}
 */
export function createReactiveFunction(getSnapshot, onSubscribe) {
  const value = new ReactiveValue(getSnapshot, onSubscribe);
  return () => value.current
}