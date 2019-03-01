import { run_all, noop, get_store_value } from './internal';

export function readable(start, value) {
	const subscribers = [];
	let stop;

	function set(newValue) {
		if (newValue === value) return;
		value = newValue;
		subscribers.forEach(s => s[1]());
		subscribers.forEach(s => s[0](value));
	}

	return {
		subscribe(run, invalidate = noop) {
			if (subscribers.length === 0) {
				stop = start(set);
			}

			const subscriber = [run, invalidate];
			subscribers.push(subscriber);
			run(value);

			return function() {
				const index = subscribers.indexOf(subscriber);
				if (index !== -1) subscribers.splice(index, 1);

				if (subscribers.length === 0) {
					stop && stop();
					stop = null;
				}
			};
		}
	};
}

export function writable(value, start = noop) {
	let stop;
	const subscribers = [];

	function set(newValue) {
		if (newValue === value) return;
		value = newValue;
		subscribers.forEach(s => s[1]());
		subscribers.forEach(s => s[0](value));
	}

	function update(fn) {
		set(fn(value));
	}

	function subscribe(run, invalidate = noop) {
		const subscriber = [run, invalidate];
		subscribers.push(subscriber);
		if (subscribers.length === 1) stop = start() || noop;
		run(value);

		return () => {
			const index = subscribers.indexOf(subscriber);
			if (index !== -1) subscribers.splice(index, 1);
			if (subscribers.length === 0) stop();
		};
	}

	return { set, update, subscribe };
}

export function derive(stores, fn) {
	const single = !Array.isArray(stores);
	if (single) stores = [stores];

	const auto = fn.length < 2;
	let value = {};

	return readable(set => {
		let inited = false;
		const values = [];

		let pending = 0;

		const sync = () => {
			if (pending) return;
			const result = fn(single ? values[0] : values, set);
			if (auto && (value !== (value = result))) set(result);
		}

		const unsubscribers = stores.map((store, i) => store.subscribe(
			value => {
				values[i] = value;
				pending &= ~(1 << i);
				if (inited) sync();
			},
			() => {
				pending |= (1 << i);
			})
		);

		inited = true;
		sync();

		return function stop() {
			run_all(unsubscribers);
		};
	});
}

export { get_store_value as get };
