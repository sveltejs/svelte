import { writable } from 'svelte/store';

export const counts = { subscribes: 0, unsubscribes: 0 };

const inner = writable('hello');

export const store = {
	/** @param {(value: string) => void} fn */
	subscribe(fn) {
		counts.subscribes += 1;
		const unsubscribe = inner.subscribe(fn);

		return () => {
			counts.unsubscribes += 1;
			unsubscribe();
		};
	}
};

export function reset() {
	counts.subscribes = 0;
	counts.unsubscribes = 0;
}
