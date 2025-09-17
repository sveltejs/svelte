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

export type RenderOutput = SyncRenderOutput & Thenable<SyncRenderOutput>;

interface Thenable<T> {
	then<TResult1 = T, TResult2 = never>(
		onfulfilled?: ((value: T) => TResult1 | Thenable<TResult1>) | undefined | null,
		onrejected?: ((reason: any) => TResult2 | Thenable<TResult2>) | undefined | null
	): Promise<TResult1 | TResult2>;
}
