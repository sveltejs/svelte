declare module '*.svelte' {
	// use prettier-ignore for a while because of https://github.com/sveltejs/language-tools/commit/026111228b5814a9109cc4d779d37fb02955fb8b
	// prettier-ignore
	import { SvelteComponent, Component, type ComponentConstructorOptions } from 'svelte'

	// Support using the component as both a class and function during the transition period
	// prettier-ignore
	interface ComponentType {
		(
			...args: Parameters<Component<Record<string, any>>>
		): ReturnType<Component<Record<string, any>, Record<string, any>>>
		new (o: ComponentConstructorOptions): SvelteComponent
	}
	const Comp: ComponentType;
	type Comp = SvelteComponent;
	export default Comp;
}

/**
 * Declares reactive state.
 *
 * Example:
 * ```ts
 * let count = $state(0);
 * ```
 *
 * https://svelte.dev/docs/svelte/$state
 *
 * @param initial The initial value
 */
declare function $state<T>(initial: T): T;
declare function $state<T>(): T | undefined;

declare namespace $state {
	type Primitive = string | number | boolean | null | undefined;

	type TypedArray =
		| Int8Array
		| Uint8Array
		| Uint8ClampedArray
		| Int16Array
		| Uint16Array
		| Int32Array
		| Uint32Array
		| Float32Array
		| Float64Array
		| BigInt64Array
		| BigUint64Array;

	/** The things that `structuredClone` can handle — https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm */
	export type Cloneable =
		| ArrayBuffer
		| DataView
		| Date
		| Error
		| Map<any, any>
		| RegExp
		| Set<any>
		| TypedArray
		// web APIs
		| Blob
		| CryptoKey
		| DOMException
		| DOMMatrix
		| DOMMatrixReadOnly
		| DOMPoint
		| DOMPointReadOnly
		| DOMQuad
		| DOMRect
		| DOMRectReadOnly
		| File
		| FileList
		| FileSystemDirectoryHandle
		| FileSystemFileHandle
		| FileSystemHandle
		| ImageBitmap
		| ImageData
		| RTCCertificate
		| VideoFrame;

	/** Turn `SvelteDate`, `SvelteMap` and `SvelteSet` into their non-reactive counterparts. (`URL` is uncloneable.) */
	type NonReactive<T> = T extends Date
		? Date
		: T extends Map<infer K, infer V>
			? Map<K, V>
			: T extends Set<infer K>
				? Set<K>
				: T;

	type Snapshot<T> = T extends Primitive
		? T
		: T extends Cloneable
			? NonReactive<T>
			: T extends { toJSON(): infer R }
				? R
				: T extends Array<infer U>
					? Array<Snapshot<U>>
					: T extends object
						? T extends { [key: string]: any }
							? { [K in keyof T]: Snapshot<T[K]> }
							: never
						: never;

	/**
	 * Declares state that is _not_ made deeply reactive — instead of mutating it,
	 * you must reassign it.
	 *
	 * Example:
	 * ```ts
	 * <script>
	 *   let items = $state.raw([0]);
	 *
	 *   const addItem = () => {
	 *     items = [...items, items.length];
	 *   };
	 * </script>
	 *
	 * <button on:click={addItem}>
	 *   {items.join(', ')}
	 * </button>
	 * ```
	 *
	 * https://svelte.dev/docs/svelte/$state#$state.raw
	 *
	 * @param initial The initial value
	 */
	export function raw<T>(initial: T): T;
	export function raw<T>(): T | undefined;
	/**
	 * To take a static snapshot of a deeply reactive `$state` proxy, use `$state.snapshot`:
	 *
	 * Example:
	 * ```ts
	 * <script>
	 *   let counter = $state({ count: 0 });
	 *
	 *   function onclick() {
	 *     // Will log `{ count: ... }` rather than `Proxy { ... }`
	 *     console.log($state.snapshot(counter));
	 *   };
	 * </script>
	 * ```
	 *
	 * https://svelte.dev/docs/svelte/$state#$state.snapshot
	 *
	 * @param state The value to snapshot
	 */
	export function snapshot<T>(state: T): Snapshot<T>;

	// prevent intellisense from being unhelpful
	/** @deprecated */
	export const apply: never;
	/** @deprecated */
	// @ts-ignore
	export const arguments: never;
	/** @deprecated */
	export const bind: never;
	/** @deprecated */
	export const call: never;
	/** @deprecated */
	export const caller: never;
	/** @deprecated */
	export const length: never;
	/** @deprecated */
	export const name: never;
	/** @deprecated */
	export const prototype: never;
	/** @deprecated */
	export const toString: never;
}

/**
 * Declares derived state, i.e. one that depends on other state variables.
 * The expression inside `$derived(...)` should be free of side-effects.
 *
 * Example:
 * ```ts
 * let double = $derived(count * 2);
 * ```
 *
 * https://svelte.dev/docs/svelte/$derived
 *
 * @param expression The derived state expression
 */
declare function $derived<T>(expression: T): T;

declare namespace $derived {
	/**
	 * Sometimes you need to create complex derivations that don't fit inside a short expression.
	 * In these cases, you can use `$derived.by` which accepts a function as its argument.
	 *
	 * Example:
	 * ```ts
	 * let total = $derived.by(() => {
	 *   let result = 0;
	 *	 for (const n of numbers) {
	 *	   result += n;
	 *   }
	 *   return result;
	 * });
	 * ```
	 *
	 * https://svelte.dev/docs/svelte/$derived#$derived.by
	 */
	export function by<T>(fn: () => T): T;

	// prevent intellisense from being unhelpful
	/** @deprecated */
	export const apply: never;
	/** @deprecated */
	// @ts-ignore
	export const arguments: never;
	/** @deprecated */
	export const bind: never;
	/** @deprecated */
	export const call: never;
	/** @deprecated */
	export const caller: never;
	/** @deprecated */
	export const length: never;
	/** @deprecated */
	export const name: never;
	/** @deprecated */
	export const prototype: never;
	/** @deprecated */
	export const toString: never;
}

/**
 * Runs code when a component is mounted to the DOM, and then whenever its dependencies change, i.e. `$state` or `$derived` values.
 * The timing of the execution is after the DOM has been updated.
 *
 * Example:
 * ```ts
 * $effect(() => console.log('The count is now ' + count));
 * ```
 *
 * If you return a function from the effect, it will be called right before the effect is run again, or when the component is unmounted.
 *
 * Does not run during server side rendering.
 *
 * https://svelte.dev/docs/svelte/$effect
 * @param fn The function to execute
 */
declare function $effect(fn: () => void | (() => void)): void;

declare namespace $effect {
	/**
	 * Runs code right before a component is mounted to the DOM, and then whenever its dependencies change, i.e. `$state` or `$derived` values.
	 * The timing of the execution is right before the DOM is updated.
	 *
	 * Example:
	 * ```ts
	 * $effect.pre(() => console.log('The count is now ' + count));
	 * ```
	 *
	 * If you return a function from the effect, it will be called right before the effect is run again, or when the component is unmounted.
	 *
	 * Does not run during server side rendering.
	 *
	 * https://svelte.dev/docs/svelte/$effect#$effect.pre
	 * @param fn The function to execute
	 */
	export function pre(fn: () => void | (() => void)): void;

	/**
	 * The `$effect.tracking` rune is an advanced feature that tells you whether or not the code is running inside a tracking context, such as an effect or inside your template.
	 *
	 * Example:
	 * ```svelte
	 * <script>
	 *   console.log('in component setup:', $effect.tracking()); // false
	 *
	 *   $effect(() => {
	 *     console.log('in effect:', $effect.tracking()); // true
	 *   });
	 * </script>
	 *
	 * <p>in template: {$effect.tracking()}</p> <!-- true -->
	 * ```
	 *
	 * This allows you to (for example) add things like subscriptions without causing memory leaks, by putting them in child effects.
	 *
	 * https://svelte.dev/docs/svelte/$effect#$effect.tracking
	 */
	export function tracking(): boolean;

	/**
	 * The `$effect.root` rune is an advanced feature that creates a non-tracked scope that doesn't auto-cleanup. This is useful for
	 * nested effects that you want to manually control. This rune also allows for creation of effects outside of the component
	 * initialisation phase.
	 *
	 * Example:
	 * ```svelte
	 * <script>
	 *   let count = $state(0);
	 *
	 *   const cleanup = $effect.root(() => {
	 *	    $effect(() => {
	 *				console.log(count);
	 *			})
	 *
	 *      return () => {
	 *        console.log('effect root cleanup');
	 * 			}
	 *   });
	 * </script>
	 *
	 * <button onclick={() => cleanup()}>cleanup</button>
	 * ```
	 *
	 * https://svelte.dev/docs/svelte/$effect#$effect.root
	 */
	export function root(fn: () => void | (() => void)): () => void;

	// prevent intellisense from being unhelpful
	/** @deprecated */
	export const apply: never;
	/** @deprecated */
	// @ts-ignore
	export const arguments: never;
	/** @deprecated */
	export const bind: never;
	/** @deprecated */
	export const call: never;
	/** @deprecated */
	export const caller: never;
	/** @deprecated */
	export const length: never;
	/** @deprecated */
	export const name: never;
	/** @deprecated */
	export const prototype: never;
	/** @deprecated */
	export const toString: never;
}

/**
 * Declares the props that a component accepts. Example:
 *
 * ```ts
 * let { optionalProp = 42, requiredProp, bindableProp = $bindable() }: { optionalProp?: number; requiredProps: string; bindableProp: boolean } = $props();
 * ```
 *
 * https://svelte.dev/docs/svelte/$props
 */
declare function $props(): any;

/**
 * Declares a prop as bindable, meaning the parent component can use `bind:propName={value}` to bind to it.
 *
 * ```ts
 * let { propName = $bindable() }: { propName: boolean } = $props();
 * ```
 *
 * https://svelte.dev/docs/svelte/$bindable
 */
declare function $bindable<T>(fallback?: T): T;

/**
 * Inspects one or more values whenever they, or the properties they contain, change. Example:
 *
 * ```ts
 * $inspect(someValue, someOtherValue)
 * ```
 *
 * `$inspect` returns a `with` function, which you can invoke with a callback function that
 * will be called with the value and the event type (`'init'` or `'update'`) on every change.
 * By default, the values will be logged to the console.
 *
 * ```ts
 * $inspect(x).with(console.trace);
 * $inspect(x, y).with(() => { debugger; });
 * ```
 *
 * https://svelte.dev/docs/svelte/$inspect
 */
declare function $inspect<T extends any[]>(
	...values: T
): { with: (fn: (type: 'init' | 'update', ...values: T) => void) => void };

/**
 * Retrieves the `this` reference of the custom element that contains this component. Example:
 *
 * ```svelte
 * <svelte:options customElement="my-element" />
 *
 * <script>
 * 	function greet(greeting) {
 * 		$host().dispatchEvent(new CustomEvent('greeting', { detail: greeting }))
 * 	}
 * </script>
 *
 * <button onclick={() => greet('hello')}>say hello</button>
 * ```
 *
 * Only available inside custom element components, and only on the client-side.
 *
 * https://svelte.dev/docs/svelte/$host
 */
declare function $host<El extends HTMLElement = HTMLElement>(): El;
