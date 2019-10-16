import { writable } from 'svelte/store';

function createCount() {
	const { subscribe, set, update } = writable(0);

	return {
		subscribe,
		increment: () => update(n => n + 1),
		decrement: () => update(n => n - 1),
		change: (parameter) => set(parameter),
		reset: () => set(0)
	};
}

export const count = createCount();