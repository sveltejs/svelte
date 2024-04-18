import type { Bindable, Binding } from '../index.js';

/** Anything except a function */
export type NotFunction<T> = T extends Function ? never : T;

export type RemoveBindable<Props extends Record<string, any>> = {
	[Key in keyof Props as NonNullable<Props[Key]> extends Binding<unknown>
		? never
		: Key]: Props[Key] extends Bindable<infer Value> ? Value : Props[Key];
};
