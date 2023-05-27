import { Spring } from './public';

export interface TickContext<T> {
	inv_mass: number;
	dt: number;
	opts: Spring<T>;
	settled: boolean;
}

export interface SpringOpts {
	stiffness?: number;
	damping?: number;
	precision?: number;
}

export interface SpringUpdateOpts {
	hard?: any;
	soft?: string | number | boolean;
}

export type Updater<T> = (target_value: T, value: T) => T;

export interface TweenedOptions<T> {
	delay?: number;
	duration?: number | ((from: T, to: T) => number);
	easing?: (t: number) => number;
	interpolate?: (a: T, b: T) => (t: number) => T;
}
