import { run_all, noop, safe_not_equal } from './internal/utils';

type Subscriber<T> = (value: T) => void;

type Unsubscriber = () => void;

type Updater<T> = (value: T) => T;

type Invalidater<T> = (value?: T) => void;

type StartStopNotifier<T> = (set: Subscriber<T>) => Unsubscriber | void;

export interface ReadableStore<T> {
	subscribe(run: Subscriber<T>, invalidate?: Invalidater<T>): Unsubscriber;
}

export interface WritableStore<T> extends ReadableStore<T> {
	set(value: T): void;
	update(updater: Updater<T>): void;
}

type SubscribeInvalidateTuple<T> = [Subscriber<T>, Invalidater<T>];

export function readable<T>(value: T, start: StartStopNotifier<T>): ReadableStore<T> {
	return {
		subscribe: writable(value, start).subscribe,
	};
}

export function writable<T>(value: T, start: StartStopNotifier<T> = noop): WritableStore<T> {
	let stop: Unsubscriber;
	const subscribers: Array<SubscribeInvalidateTuple<T>> = [];

	function set(new_value: T): void {
		if (safe_not_equal(value, new_value)) {
			value = new_value;
			if (!stop) {
				return; // not ready
			}
			subscribers.forEach((s) => s[1]());
			subscribers.forEach((s) => s[0](value));
		}
	}

	function update(fn: Updater<T>): void {
		set(fn(value));
	}

	function subscribe(run: Subscriber<T>, invalidate: Invalidater<T> = noop): Unsubscriber {
		const subscriber: SubscribeInvalidateTuple<T> = [run, invalidate];
		subscribers.push(subscriber);
		if (subscribers.length === 1) {
			stop = start(set) || noop;
		}
		run(value);

		return () => {
			const index = subscribers.indexOf(subscriber);
			if (index !== -1) {
				subscribers.splice(index, 1);
			}
			if (subscribers.length === 0) {
				stop();
			}
		};
	}

	return { set, update, subscribe };
}

export function derived<T>(
	stores: ReadableStore<T> | Array<ReadableStore<T>>,
	fn: (values: T | T[], set?: Subscriber<T>) => T | Unsubscriber | void,
	initial_value: T): ReadableStore<T> {

	const single = !Array.isArray(stores);
	const stores_array: Array<ReadableStore<T>> = single
		? [stores as ReadableStore<T>]
		: stores as Array<ReadableStore<T>>;

	const auto = fn.length < 2;

	return readable(initial_value, (set) => {
		let inited = false;
		const values: T[] = [];

		let pending = 0;
		let cleanup = noop;

		const sync = () => {
			if (pending) {
				return;
			}
			cleanup();
			const result = fn(single ? values[0] : values, set);
			if (auto) {
				set(result as T);
			} else {
				cleanup = result as Unsubscriber || noop;
			}
		};

		const unsubscribers = stores_array.map((store, i) => store.subscribe(
			(value) => {
				values[i] = value;
				pending &= ~(1 << i);
				if (inited) {
					sync();
				}
			},
			() => {
				pending |= (1 << i);
			}),
		);

		inited = true;
		sync();

		return function stop() {
			run_all(unsubscribers);
			cleanup();
		};
	});
}

export function get<T>(store: ReadableStore<T>): T {
	let value: T | undefined;
	store.subscribe((_: T) => value = _)();
	return value as T;
}
