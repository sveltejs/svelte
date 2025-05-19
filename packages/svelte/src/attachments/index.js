/** @import { FromAction } from './public.js' */
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
 * Converts an Action into an Attachment keeping the same behavior. It's useful if you want to start using
 * attachments on Components but you have library provided actions.
 * @type {FromAction}
 * @since 5.32
 */
export function fromAction(action, /** @type {() => any} */ get_arg = noop) {
	return (element) => {
		const { update, destroy } = untrack(() => action(element, get_arg()) ?? {});

		if (update) {
			var ran = false;
			render_effect(() => {
				const arg = get_arg();
				if (ran) update(arg);
			});
			ran = true;
		}

		if (destroy) {
			teardown(destroy);
		}
	};
}
