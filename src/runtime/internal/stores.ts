import { safe_not_equal, noop } from './utils';
type Setter<T> = (value: T) => void;
type StopCallback = () => void;
export type StartStopNotifier<T> = (set: Setter<T>) => StopCallback | void;
type Subscriber<T> = (value: T) => void;
type Unsubscriber = () => void;
export class Store<T> {
	static update_queue: Store<any>[] = [];
	static is_flushing = false;
	static flush(store: Store<any>) {
		this.update_queue.push(store);
		if (this.is_flushing) return;
		this.is_flushing = true;
		for (let i = 0, j = 0, subscribers, value; i < this.update_queue.length; i++) {
			for (j = 0, { subscribers, value } = this.update_queue[i]; j < subscribers.length; j++) {
				subscribers[j].r(value);
			}
		}
		this.update_queue.length = +(this.is_flushing = false);
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
		for (let i = 0; i < this.subscribers.length; i++) this.subscribers[i].i();
		Store.flush(this);
	}
	subscribe(run: Subscriber<T>, invalidate = noop) {
		const subscriber = { r: run, i: invalidate };
		this.subscribers.push(subscriber);
		run(this.value), (this.has_subscribers = true);
		return this.unsubscribe.bind(this, subscriber) as Unsubscriber;
	}
	unsubscribe(subscriber) {
		this.subscribers.splice(this.subscribers.indexOf(subscriber), 1);
		this.has_subscribers = !!this.subscribers.length;
	}
}
export class Writable<T> extends Store<T> {
	start: StartStopNotifier<T>;
	stop = noop;
	constructor(initial: T, startStopNotifier: StartStopNotifier<T>) {
		super(initial);
		this.start = startStopNotifier || noop;
	}
	subscribe(run, invalidate) {
		if (!super.has_subscribers) this.stop = this.start(this.set.bind(this)) || noop;
		return super.subscribe(run, invalidate);
	}
	set(next_value: T) {
		if (this.stop && safe_not_equal(super.value, next_value)) super.set(next_value);
	}
	update(fn) {
		this.set(fn(this.value));
	}
	unsubscribe(subscriber) {
		super.unsubscribe(subscriber);
		if (!super.has_subscribers && this.stop) this.stop(), (this.stop = null);
	}
}
