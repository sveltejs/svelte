import { run_all } from './internal.js';

export function readable(start, value) {
	const subscribers = [];
	let stop;

	function set(newValue) {
		if (newValue === value) return;
		value = newValue;
		subscribers.forEach(fn => fn(value));
	}

	return {
		subscribe(fn) {
			if (subscribers.length === 0) {
				stop = start(set);
			}

			subscribers.push(fn);
			fn(value);

			return function() {
				const index = subscribers.indexOf(fn);
				if (index !== -1) subscribers.splice(index, 1);

				if (subscribers.length === 0) {
					stop && stop();
					stop = null;
				}
			};
		}
	};
}

export function writable(value) {
	const subscribers = [];

	function set(newValue) {
		if (newValue === value) return;
		value = newValue;
		subscribers.forEach(fn => fn(value));
	}

	function update(fn) {
		set(fn(value));
	}

	function subscribe(fn) {
		subscribers.push(fn);
		fn(value);

		return () => {
			const index = subscribers.indexOf(fn);
			if (index !== -1) subscribers.splice(index, 1);
		};
	}

	return { set, update, subscribe };
}

export function derive(stores, fn) {
	const single = !Array.isArray(stores);
	if (single) stores = [stores];

	const auto = fn.length === 1;

	return readable(set => {
		let inited = false;
		const values = [];

		const sync = () => {
			const result = fn(single ? values[0] : values, set);
			if (auto) set(result);
		}

		const unsubscribers = stores.map((store, i) => store.subscribe(value => {
			values[i] = value;
			if (inited) sync();
		}));

		inited = true;
		sync();

		return function stop() {
			run_all(unsubscribers);
		};
	});
}
