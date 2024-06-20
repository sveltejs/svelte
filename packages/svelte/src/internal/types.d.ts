import type { Component, ComponentProps, ComponentType, SvelteComponent } from 'svelte';

/** Anything except a function */
export type NotFunction<T> = T extends Function ? never : T;

type RemoveRequired<T> = {
	[K in keyof T]-?: T[K];
};

type MapRequired<T, Plain = RemoveRequired<T>> = {
	[K in keyof T]-?: K extends keyof Plain ? ([T[K]] extends [Plain[K]] ? true : false) : false;
};

type IsEmpty<T> = [{}] extends [T] ? true : false;

/**
 * Check if a component has all optional props
 */
export type AllOptionalProps<TProps> =
	MapRequired<TProps> extends Record<keyof TProps, false>
		? true
		: IsEmpty<TProps> extends true
			? true
			: false;

export type ComponentOrSvelteComponent<
	TComponent extends Component | ComponentType<SvelteComponent>
> = TComponent extends ComponentType<infer SvelteComponent> ? SvelteComponent : TComponent;
