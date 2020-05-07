import { get_store_value, Writable, StartStopNotifier, Derived } from 'svelte/internal';
export { get_store_value as get };
export function readable<T>(value: T, start: StartStopNotifier<T>) {
	const store = new Writable(value, start);
	return { subscribe: store.subscribe.bind(store) };
}
export function writable<T>(value: T, start: StartStopNotifier<T>) {
	const store = new Writable(value, start);
	return { set: store.set.bind(store), update: store.update.bind(store), subscribe: store.subscribe.bind(store) };
}
export function derived(stores, deriver, initial_value?) {
	const store = new Derived(stores, deriver, initial_value);
	return { subscribe: store.subscribe.bind(store) };
}
