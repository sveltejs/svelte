import type { ActionReturn } from 'svelte/action';

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

export interface FromAction<Element extends EventTarget = HTMLElement, Par = unknown> {
	<Node extends Element, Parameter extends Par>(
		...args: undefined extends NoInfer<Parameter>
			? [
					action: (node: Node, parameter?: never) => void | ActionReturn<Parameter>,
					parameter?: () => NoInfer<Parameter>
				]
			: [
					action: (node: Node, parameter: Parameter) => void | ActionReturn<Parameter>,
					parameter: () => NoInfer<Parameter>
				]
	): Attachment<Node>;
}

export * from './index.js';
