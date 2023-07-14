import { Invalidator } from './private.js';

/** <span class="vo">[Callback](/docs/development#callback)</span> pour informer des changements d'une valeur. */
export type Subscriber<T> = (value: T) => void;

/** Permet de se désabonner des changements d'une valeur */
export type Unsubscriber = () => void;

/** <span class="vo">[Callback](/docs/development#callback)</span> pour mettre à jour une valeur. */
export type Updater<T> = (value: T) => T;

/**
 * Lance et arrête les <span class="vo">[callbacks](/docs/development#callback)</span> d'abonnement.
 * Cette fonction est appelée quand le premier abonné s'abonne.
 *
 * @param {(value: T) => void} set Function that sets the value of the store.
 * @param {(value: Updater<T>) => void} update Function that sets the value of the store after passing the current value to the update function.
 * @returns {void | (() => void)} Optionally, a cleanup function that is called when the last remaining
 * subscriber unsubscribes.
 */
export type StartStopNotifier<T> = (
	set: (value: T) => void,
	update: (fn: Updater<T>) => void
) => void | (() => void);

/** Interface Readable pour s'abonner. */
export interface Readable<T> {
	/**
	 * Permet de s'abonner aux changements de valeur.
	 * @param run <span class="vo">[callback](/docs/development#callback)</span> d'abonnement
	 * @param invalidate <span class="vo">[callback](/docs/development#callback)</span> de nettoyage
	 */
	subscribe(this: void, run: Subscriber<T>, invalidate?: Invalidator<T>): Unsubscriber;
}

/** Interface Writable for s'abonner et mettre à jour. */
export interface Writable<T> extends Readable<T> {
	/**
	 * Change la valeur et informe les abonnés.
	 * @param value to set
	 */
	set(this: void, value: T): void;

	/**
	 * Met la valeur à jour en utilisant le <span class="vo">[callback](/docs/development#callback)</span> et informe les abonnés.
	 * @param updater callback
	 */
	update(this: void, updater: Updater<T>): void;
}

export * from './index.js';
