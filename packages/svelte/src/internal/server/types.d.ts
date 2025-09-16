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

export interface RenderOutput {
	/** HTML that goes into the `<head>` */
	head: string;
	/** @deprecated use `body` instead */
	html: string;
	/** HTML that goes somewhere into the `<body>` */
	body: string;
}
