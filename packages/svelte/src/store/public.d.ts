import type { Invalidator } from './private.js';

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
 * @param {(value: T) => void} set Fonction qui change la valeur du <span class="vo">[store](/docs/sveltejs#store)</span>.
 *
 * @param {(value: Updater<T>) => void} update Fonction qui change la valeur du <span class="vo">[store](/docs/sveltejs#store)</span>
 * après avoir passé la valeur actuelle à la fonction de mise à jour.
 * @returns {void | (() => void)} Une fonction de nettoyage optionnelle qui est appelée quand le dernier abonné se désabonne.
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
	 * @param value une valeur
	 */
	set(this: void, value: T): void;

	/**
	 * Met la valeur à jour en utilisant le <span class="vo">[callback](/docs/development#callback)</span> et informe les abonnés.
	 * @param updater <span class="vo">[callback](/docs/development#callback)</span>
	 */
	update(this: void, updater: Updater<T>): void;
}

export * from './index.js';
