/** @import { Action, ActionReturn } from 'svelte/action' */
/** @import { Attachment } from 'svelte/attachments' */
import { noop, render_effect } from 'svelte/internal/client';
import { ATTACHMENT_KEY } from '../constants.js';
import { untrack } from 'svelte';
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
 * @template {EventTarget} E
 * @template {unknown} T
 * @overload
 * @param {Action<E, T> | function(E, T): void | ActionReturn<T>} action The action function
 * @param {() => T} fn A function that returns the argument for the action
 * @returns {Attachment<E>}
 */
/**
 * @template {EventTarget} E
 * @overload
 * @param {Action<E, void> | function(E): void | ActionReturn<void>} action The action function
 * @returns {Attachment<E>}
 */
/**
 * Converts an Action into an Attachment keeping the same behavior. It's useful if you want to start using
 * attachments on Components but you have library provided actions.
 *
 * Note that the second argument, if provided, must be a function that _returns_ the argument to the
 * action function, not the argument itself.
 *
 * @template {EventTarget} E
 * @template {unknown} T
 * @param {Action<E, T> | function(E, T): void | ActionReturn<T>} action The action function
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
