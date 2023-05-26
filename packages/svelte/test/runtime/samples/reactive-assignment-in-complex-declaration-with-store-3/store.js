import { writable } from 'svelte/store';
const _store = writable(0);
let count = 0;

export const store = {
	..._store,
	subscribe(fn) {
		count++;
		return _store.subscribe(fn);
	},
	reset() {
		count = 0;
		_store.set(0);
	},
	numberOfTimesSubscribeCalled() {
		return count;
	}
};
