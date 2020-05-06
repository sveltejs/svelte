import { subscribe, noop, get_store_value, Writable, StartStopNotifier } from 'svelte/internal';
export { get_store_value as get };
export function readable<T>(value: T, start: StartStopNotifier<T>) {
	const store = new Writable(value, start);
	return { subscribe: store.subscribe.bind(store) };
}
export function writable<T>(value: T, start: StartStopNotifier<T>) {
	const store = new Writable(value, start);
	return { set: store.set.bind(store), update: store.update.bind(store), subscribe: store.subscribe.bind(store) };
}
export function derived<T, S>(stores: S, deriver, initial_value?: T) {
	let cleanup = noop;
	const dispatcher =
		deriver.length < 2
			? (set, v) => void set(deriver(v))
			: (set, v) => void (cleanup(), typeof (cleanup = deriver(v, set)) !== 'function' && (cleanup = noop));
	return readable(
		initial_value,
		Array.isArray(stores)
			? (set) => {
					set = dispatcher.bind(null, set);
					let l = stores.length;
					let pending = 1 << l;
					const values = new Array(l);
					const unsubs = stores.map((store, i) =>
						subscribe(
							store,
							// @ts-ignore
							(v) => void ((values[i] = v), !(pending &= ~(1 << i)) && set(values)),
							() => void (pending |= 1 << i)
						)
					);
					// @ts-ignore
					if (!(pending &= ~(1 << l))) set(values);
					return () => {
						while (l--) unsubs[l]();
						cleanup();
					};
			  }
			: (set) => {
					const unsub = subscribe(stores, dispatcher.bind(null, set));
					return () => void (unsub(), cleanup());
			  }
	);
}
