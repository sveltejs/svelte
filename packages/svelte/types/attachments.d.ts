/// <reference path="./ambient.d.ts" />
import type { Brand, Branded, Component, ComponentConstructorOptions, ComponentEvents, ComponentInternals, ComponentProps, ComponentType, DispatchOptions, EventDispatcher, Fork, Getters, MountOptions, NotFunction, Properties, Snippet, SnippetReturn, SvelteComponent, SvelteComponentTyped, afterUpdate, beforeUpdate, brand, createContext, createEventDispatcher, createRawSnippet, flushSync, fork, getAbortSignal, getAllContexts, getContext, hasContext, hydratable, hydrate, mount, onDestroy, onMount, setContext, settled, tick, unmount, untrack } from './shared';
/**
 * An [attachment](https://svelte.dev/docs/svelte/@attach) is a function that runs when an element is mounted
 * to the DOM, and optionally returns a function that is called when the element is later removed.
 *
 * It can be attached to an element with an `{@attach ...}` tag, or by spreading an object containing
 * a property created with [`createAttachmentKey`](https://svelte.dev/docs/svelte/svelte-attachments#createAttachmentKey).
 */
export interface Attachment<T extends EventTarget = Element> {
	(element: T): void | (() => void);
}
/**
 * Creates an object key that will be recognised as an attachment when the object is spread onto an element,
 * as a programmatic alternative to using `{@attach ...}`. This can be useful for library authors, though
 * is generally not needed when building an app.
 *
 * ```svelte
 * <script>
 * 	import { createAttachmentKey } from 'svelte/attachments';
 *
 * 	const props = {
 * 		class: 'cool',
 * 		onclick: () => alert('clicked'),
 * 		[createAttachmentKey()]: (node) => {
 * 			node.textContent = 'attached!';
 * 		}
 * 	};
 * </script>
 *
 * <button {...props}>click me</button>
 * ```
 * @since 5.29
 */
export function createAttachmentKey(): symbol;
/**
 * Converts an [action](https://svelte.dev/docs/svelte/use) into an [attachment](https://svelte.dev/docs/svelte/@attach) keeping the same behavior.
 * It's useful if you want to start using attachments on components but you have actions provided by a library.
 *
 * Note that the second argument, if provided, must be a function that _returns_ the argument to the
 * action function, not the argument itself.
 *
 * ```svelte
 * <!-- with an action -->
 * <div use:foo={bar}>...</div>
 *
 * <!-- with an attachment -->
 * <div {@attach fromAction(foo, () => bar)}>...</div>
 * ```
 * */
export function fromAction<E extends EventTarget, T extends unknown>(action: Action<E, T> | ((element: E, arg: T) => void | ActionReturn<T>), fn: () => T): Attachment<E>;
/**
 * Converts an [action](https://svelte.dev/docs/svelte/use) into an [attachment](https://svelte.dev/docs/svelte/@attach) keeping the same behavior.
 * It's useful if you want to start using attachments on components but you have actions provided by a library.
 *
 * Note that the second argument, if provided, must be a function that _returns_ the argument to the
 * action function, not the argument itself.
 *
 * ```svelte
 * <!-- with an action -->
 * <div use:foo={bar}>...</div>
 *
 * <!-- with an attachment -->
 * <div {@attach fromAction(foo, () => bar)}>...</div>
 * ```
 * */
export function fromAction<E extends EventTarget>(action: Action<E, void> | ((element: E) => void | ActionReturn<void>)): Attachment<E>;
/**
 * Actions can return an object containing the two properties defined in this interface. Both are optional.
 * - update: An action can have a parameter. This method will be called whenever that parameter changes,
 *   immediately after Svelte has applied updates to the markup. `ActionReturn` and `ActionReturn<undefined>` both
 *   mean that the action accepts no parameters.
 * - destroy: Method that is called after the element is unmounted
 *
 * Additionally, you can specify which additional attributes and events the action enables on the applied element.
 * This applies to TypeScript typings only and has no effect at runtime.
 *
 * Example usage:
 * ```ts
 * interface Attributes {
 * 	newprop?: string;
 * 	'on:event': (e: CustomEvent<boolean>) => void;
 * }
 *
 * export function myAction(node: HTMLElement, parameter: Parameter): ActionReturn<Parameter, Attributes> {
 * 	// ...
 * 	return {
 * 		update: (updatedParameter) => {...},
 * 		destroy: () => {...}
 * 	};
 * }
 * ```
 */
export interface ActionReturn<
	Parameter = undefined,
	Attributes extends Record<string, any> = Record<never, any>
> {
	update?: (parameter: Parameter) => void;
	destroy?: () => void;
	/**
	 * ### DO NOT USE THIS
	 * This exists solely for type-checking and has no effect at runtime.
	 * Set this through the `Attributes` generic instead.
	 */
	$$_attributes?: Attributes;
}

/**
 * Actions are functions that are called when an element is created.
 * You can use this interface to type such actions.
 * The following example defines an action that only works on `<div>` elements
 * and optionally accepts a parameter which it has a default value for:
 * ```ts
 * export const myAction: Action<HTMLDivElement, { someProperty: boolean } | undefined> = (node, param = { someProperty: true }) => {
 *   // ...
 * }
 * ```
 * `Action<HTMLDivElement>` and `Action<HTMLDivElement, undefined>` both signal that the action accepts no parameters.
 *
 * You can return an object with methods `update` and `destroy` from the function and type which additional attributes and events it has.
 * See interface `ActionReturn` for more details.
 */
export interface Action<
	Element = HTMLElement,
	Parameter = undefined,
	Attributes extends Record<string, any> = Record<never, any>
> {
	<Node extends Element>(
		...args: undefined extends Parameter
			? [node: Node, parameter?: Parameter]
			: [node: Node, parameter: Parameter]
	): void | ActionReturn<Parameter, Attributes>;
}

// Implementation notes:
// - undefined extends X instead of X extends undefined makes this work better with both strict and nonstrict mode

export {};

