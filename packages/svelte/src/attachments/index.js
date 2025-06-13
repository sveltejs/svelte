/** @import { Action, ActionReturn } from '../action/public' */
/** @import { Attachment } from './public' */
import { noop, render_effect } from 'svelte/internal/client';
import { ATTACHMENT_KEY } from '../constants.js';
import { untrack } from '../index-client.js';
import { teardown } from '../internal/client/reactivity/effects.js';

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
export function createAttachmentKey() {
	return Symbol(ATTACHMENT_KEY);
}

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
 * @template {EventTarget} E
 * @template {unknown} T
 * @overload
 * @param {Action<E, T> | ((element: E, arg: T) => void | ActionReturn<T>)} action The action function
 * @param {() => T} fn A function that returns the argument for the action
 * @returns {Attachment<E>}
 */
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
 * @template {EventTarget} E
 * @overload
 * @param {Action<E, void> | ((element: E) => void | ActionReturn<void>)} action The action function
 * @returns {Attachment<E>}
 */
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
 *
 * @template {EventTarget} E
 * @template {unknown} T
 * @param {Action<E, T> | ((element: E, arg: T) => void | ActionReturn<T>)} action The action function
 * @param {() => T} fn A function that returns the argument for the action
 * @returns {Attachment<E>}
 * @since 5.32
 */
export function fromAction(action, fn = /** @type {() => T} */ (noop)) {
	return (element) => {
		const { update, destroy } = untrack(() => action(element, fn()) ?? {});

		if (update) {
			var ran = false;
			render_effect(() => {
				const arg = fn();
				if (ran) update(arg);
			});
			ran = true;
		}

		if (destroy) {
			teardown(destroy);
		}
	};
}
