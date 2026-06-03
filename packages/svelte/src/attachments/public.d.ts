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

export * from './index.js';
