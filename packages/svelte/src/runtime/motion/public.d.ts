import { Readable } from '../store/public.js';
import { SpringUpdateOpts, TweenedOptions, Updater } from './private';

export interface Spring<T> extends Readable<T> {
	set: (new_value: T, opts?: SpringUpdateOpts) => Promise<void>;
	update: (fn: Updater<T>, opts?: SpringUpdateOpts) => Promise<void>;
	precision: number;
	damping: number;
	stiffness: number;
}

export interface Tweened<T> extends Readable<T> {
	set(value: T, opts?: TweenedOptions<T>): Promise<void>;
	update(updater: Updater<T>, opts?: TweenedOptions<T>): Promise<void>;
}

export * from './index.js';
