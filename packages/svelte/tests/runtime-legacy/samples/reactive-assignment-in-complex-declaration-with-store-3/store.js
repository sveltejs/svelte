import { writable } from 'svelte/store';
const _store = writable(0);
let count = 0;
let is_subscribed = false;

export const store = {
	..._store,

	/** @param {(value: any) => void} fn */
	subscribe(fn) {
		count++;
		is_subscribed = true;
		const unsub = _store.subscribe(fn);
		return () => {
			is_subscribed = false;
			unsub();
		};
	},
	reset() {
		count = 0;
		is_subscribed = false;
		_store.set(0);
	},
	numberOfTimesSubscribeCalled() {
		return count;
	},
	isSubscribed() {
		return is_subscribed;
	}
};
