import { writable } from 'svelte/store';

function createCounter() {
	const { subscribe, set, update } = writable(0);

	return {
		subscribe,
		increment: () => {},
		decrement: () => {},
		reset: () => {}
	};
}

export const counter = createCounter();