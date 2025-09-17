import type { Element } from './dev';
import type { Payload } from './payload';

export interface SSRContext {
	/** parent */
	p: null | SSRContext;
	/** component context */
	c: null | Map<unknown, unknown>;
	/** payload (renderer) */
	r: null | Payload;
	/** dev mode only: the current component function */
	function?: any;
	/** dev mode only: the current element */
	element?: Element;
}

export interface SyncRenderOutput {
	/** HTML that goes into the `<head>` */
	head: string;
	/** @deprecated use `body` instead */
	html: string;
	/** HTML that goes somewhere into the `<body>` */
	body: string;
}

export interface RenderOutput extends SyncRenderOutput {
	/** Render the component asynchronously by `await`ing or calling `then` on the result of `render`. */
	then: (
		onfulfilled: (value: SyncRenderOutput) => void,
		onrejected: (reason: unknown) => void
	) => void;
}
