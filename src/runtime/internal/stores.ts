import { safe_not_equal, subscribe } from './utils';
import { onEachFrame, loop } from './loop';
import { noop } from 'svelte/environment';
type Setter<T> = (value: T) => void;
type StopCallback = () => void;
export type StartStopNotifier<T> = (set: Setter<T>) => StopCallback | void;
type Subscriber<T> = (value: T) => void;
type Unsubscriber = () => void;
interface Observable<T> {
	subscribe(callback: Subscriber<T>): Unsubscriber;
}
type Obs = Observable<unknown>[] | Observable<unknown>;
type Deriver<T> = (values: any, setter?: Setter<T>) => void | (() => void) | T;

/**
 * Internal Svelte Observable
 */
export class Store<T> {
	static value_queue: Store<any>['value'][] = [];
	static update_queue: Store<any>['subscribers'][] = [];
	static is_flushing = false;
	static flush(store: Store<any>) {
		this.value_queue.push(store.value);
		this.update_queue.push([...store.subscribers]);
		if (this.is_flushing) return;
		this.is_flushing = true;
		for (let i = 0, j = 0, subscribers, value; i < this.update_queue.length; i++)
			for (j = 0, subscribers = this.update_queue[i], value = this.value_queue[i]; j < subscribers.length; j++)
				subscribers[j].run(value);
		this.update_queue.length = this.value_queue.length = 0;
		this.is_flushing = false;
	}
	value: T;
	has_subscribers = false;
	subscribers = [];
	constructor(initial: T) {
		this.value = initial;
	}
	set(next_value: T) {
		this.value = next_value;
		if (!this.has_subscribers) return;
		for (let i = 0; i < this.subscribers.length; i++) this.subscribers[i].invalidate();
		Store.flush(this);
	}
	subscribe(run: Subscriber<T>, invalidate = noop) {
		const subscriber = { run, invalidate };
		this.subscribers.push(subscriber);
		run(this.value), (this.has_subscribers = true);
		return this.unsubscribe.bind(this, subscriber) as Unsubscriber;
	}
	unsubscribe(subscriber) {
		const index = this.subscribers.indexOf(subscriber);
		if (~index) {
			if (Store.is_flushing) subscriber.run = subscriber.invalidate = noop;
			this.subscribers.splice(index, 1);
			this.has_subscribers = !!this.subscribers.length;
			return true;
		}
		return false;
	}
}
/**
 * like Store but
 * + StartStopNotifier
 * + update function
 */
class StartStopWritable<T> extends Store<T> {
	start: StartStopNotifier<T>;
	stop = noop;
	constructor(initial: T, startStopNotifier: StartStopNotifier<T>) {
		super(initial);
		this.start = startStopNotifier || noop;
	}
	subscribe(run, invalidate?) {
		// *must* run *after* first subscription ?
		if (!super.has_subscribers) this.stop = this.start(this.set.bind(this)) || noop;
		return super.subscribe(run, invalidate);
	}
	set(next_value: T) {
		if (this.stop) super.set(next_value);
	}
	update(fn) {
		this.set(fn(this.value));
	}
	unsubscribe(subscriber) {
		if (super.unsubscribe(subscriber)) {
			if (!this.has_subscribers) this.stop();
			return true;
		}
		return false;
	}
}
/**
 * StartStopWritable but
 * + safe_not_equal
 */
export class Writable<T> extends StartStopWritable<T> {
	set(next_value: T) {
		if (safe_not_equal(this.value, next_value)) super.set(next_value);
	}
}
export class Derived<S extends Obs, D extends Deriver<T>, T> extends StartStopWritable<T> {
	cleanup = noop;
	target;
	deriver;
	set: (value_s: unknown | unknown[]) => void;
	constructor(stores: S, deriver: D, initial_value?: T) {
		super(
			initial_value,
			Array.isArray(stores)
				? (_set) => {
						let l = stores.length;
						let pending = 1 << l;
						const values = new Array(l);
						const unsubs = stores.map((store, i) =>
							subscribe(
								store,
								(v) => void ((values[i] = v), !(pending &= ~(1 << i)) && this.set(values)),
								() => void (pending |= 1 << i)
							)
						);
						if (!(pending &= ~(1 << l))) this.set(values);
						return () => {
							while (l--) unsubs[l]();
							this.cleanup();
						};
				  }
				: (_set) => ((unsub) => void (unsub(), this.cleanup())).bind(this, subscribe(stores, this.set))
		);
		this.target = stores;
		this.set =
			// deriver defines < 2 arguments ?
			deriver.length < 2
				? // deriver returned value is store value
				  (v) => void super.set(deriver(v) as T)
				: // deriver returned value is cleanup | void
				  // store value is set manually within deriver
				  (v) =>
						void (this.cleanup(),
						typeof (this.cleanup = deriver(v, super.set.bind(this)) as () => void) !== 'function' &&
							(this.cleanup = noop));
	}
}
export type initCreateMotionTick<T> = (set: (value: T) => void) => createMotionTick<T>;
export type initCreateTweenTick<T> = (set: (value: T) => void) => createTweenTick<T>;
export type createMotionTick<T> = (prev_value: T, next_value: T) => SpringTick<T>;
export type createTweenTick<T> = (prev_value: T, next_value: T) => TweenTick;
export type SpringTick<T> = (current_value: T, elapsed: number, dt: number) => boolean;
export type TweenTick = (t: number) => boolean;

/** applies motion function initializer to every leaf of any shape of array-like or object literal like value */
const parseStructure = <T>(
	obj: unknown,
	schema: initCreateMotionTick<T> | initCreateTweenTick<T>
): initCreateMotionTick<T> | initCreateTweenTick<T> => {
	const isArray = Array.isArray(obj);
	if (typeof obj === 'object' && obj !== null && (isArray || Object.prototype === Object.getPrototypeOf(obj))) {
		const keys = Object.keys(obj);
		let i = 0,
			l = keys.length,
			k = '',
			createTickers = keys.map((key) => parseStructure(obj[key], schema)((next_value) => (obj[key] = next_value))),
			tickers = new Array(l),
			pending = 0;
		const target = { ...obj };
		obj = isArray ? [...(obj as T[])] : { ...obj };
		return (set) => (_, to_value) => {
			for (k in to_value) if (to_value[k] !== obj[k]) target[k] = to_value[k];
			for (i = 0; i < l; i++) (pending |= 1 << i), (tickers[i] = createTickers[i](obj[keys[i]], target[keys[i]]));
			return (_, elapsed, dt) => {
				for (i = 0; i < l; i++) if (pending & (1 << i) && !tickers[i](obj[keys[i]], elapsed, dt)) pending &= ~(1 << i);
				set(isArray ? [...(obj as T[])] : { ...(obj as any) });
				return !!pending;
			};
		};
	}
	return schema;
};
abstract class MotionStore<T> extends Store<T> {
	running = false;
	cancel = noop;
	init;
	create;
	tick;
	constructor(value: T, startSetTick: initCreateMotionTick<T> | initCreateTweenTick<T>) {
		super(value);
		this.create = parseStructure(value, (this.init = startSetTick))(super.set.bind(this));
	}
	set(next_value: T) {
		const this_id = ++this.uidRunning;
		this.clearStateSubscribers(false);
		if (!this.value && (this.value as unknown) !== 0) {
			this.setImmediate(next_value);
		} else {
			this.tick = this.create(this.value, next_value);
			this.loop(() => this.clearStateSubscribers(true));
			this.running = true;
		}
		return {
			then: (resolve, reject) => {
				const stop = (has_ended) => (this.uidRunning === this_id ? resolve : reject)(has_ended);
				if (!this.running || this_id !== this.uidRunning) stop(true);
				else this.onCompletionSubscribers.push(stop);
			},
		};
	}
	abstract loop(stop): void;
	setImmediate(value) {
		this.create = parseStructure(value, this.init)(super.set.bind(this));
		super.set((this.value = value));
		if (this.running) this.cancel();
		this.running = false;
	}
	onCompletionSubscribers = [];
	onRestSubscribers = [];
	uidRunning = 0;
	onRest(callback: Subscriber<void>) {
		this.onRestSubscribers.push(callback);
		return () => {
			const index = this.onRestSubscribers.indexOf(callback);
			if (~index) this.onRestSubscribers[index] = noop;
		};
	}
	clearStateSubscribers(has_ended: boolean) {
		let i = 0,
			l = this.onRestSubscribers.length;
		if (has_ended) {
			this.running = false;
			if (l)
				for (; i < this.onRestSubscribers.length; i++) {
					this.onRestSubscribers[i]();
					if (this.onRestSubscribers[i] === noop) this.onRestSubscribers.splice(i--, 1);
				}
		}
		for (i = 0, l = this.onCompletionSubscribers.length; i < l; i++) this.onCompletionSubscribers[i](has_ended);
		this.onCompletionSubscribers.length = 0;
	}
}
export class SpringMotion<T> extends MotionStore<T> {
	init: initCreateMotionTick<T>;
	create: createMotionTick<T>;
	tick: SpringTick<T>;
	elapsed = 0.0;
	loop(stop) {
		this.elapsed = 0.0;
		if (!this.running) this.cancel = onEachFrame((dt) => this.tick(this.value, (this.elapsed += dt), dt), stop);
	}
}
export class TweenMotion<T> extends MotionStore<T> {
	init: initCreateTweenTick<T>;
	create: createTweenTick<T>;
	tick: TweenTick;
	loop(stop) {
		if (this.running) this.cancel();
		this.cancel = loop((t) => this.tick(t) || (stop(), false));
	}
}
