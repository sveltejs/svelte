import { Writable, StartStopNotifier, Derived, subscribe } from 'svelte/internal';
export const get = (store) => (subscribe(store, (v) => void (store = v))(), store);
export const readable = <T>(value: T, start: StartStopNotifier<T>) => {
	const store = new Writable(value, start);
	return { subscribe: store.subscribe.bind(store) };
};
export const writable = <T>(value: T, start: StartStopNotifier<T>) => {
	const store = new Writable(value, start);
	return { set: store.set.bind(store), update: store.update.bind(store), subscribe: store.subscribe.bind(store) };
};
export const derived = (stores, deriver, initial_value?) => {
	const store = new Derived(stores, deriver, initial_value);
	return { subscribe: store.subscribe.bind(store) };
};
