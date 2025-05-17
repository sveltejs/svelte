/**
 * @import { FromAction } from "./public.js";
 * @import { ActionReturn } from "svelte/action";
 */
import { render_effect } from 'svelte/internal/client';
import { ATTACHMENT_KEY } from '../constants.js';

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
 */
export function fromAction(action, args) {
	return (element) => {
		/**
		 * @typedef {typeof args} Args;
		 */

		/**
		 * @type {ReturnType<NonNullable<Args>> | undefined}
		 */
		let actual_args;
		/**
		 * @type {ActionReturn['update']}
		 */
		let update;
		/**
		 * @type {ActionReturn['destroy']}
		 */
		let destroy;
		render_effect(() => {
			actual_args = args?.();
			update?.(/** @type {any} */ (actual_args));
		});

		render_effect(() => {
			return () => {
				destroy?.();
			};
		});
		({ update, destroy } = /** @type {ActionReturn} */ (
			action(element, /** @type {any} */ (actual_args))
		));
	};
}
