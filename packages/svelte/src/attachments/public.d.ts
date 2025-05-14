export interface Attachment {
	(element: Element): void | (() => void);
}

export * from './index.js';
