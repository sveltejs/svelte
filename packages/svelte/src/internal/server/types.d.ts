import type { MaybePromise } from '#shared';
import type { Element } from './dev';
import type { Renderer } from './renderer';

export interface SSRContext {
	/** parent */
	p: null | SSRContext;
	/** component context */
	c: null | Map<unknown, unknown>;
	/** renderer */
	r: null | Renderer;
	/** dev mode only: the current component function */
	function?: any;
	/** dev mode only: the current element */
	element?: Element;
}

export interface HydratableLookupEntry {
	value: unknown;
	root_index: number;
}

export interface HydratableContext {
	lookup: Map<string, HydratableLookupEntry>;
	values: MaybePromise<string>[];
	unresolved_promises: Map<Promise<unknown>, string>;
}

export interface RenderContext {
	hydratable: HydratableContext;
}

export interface SyncRenderOutput {
	/** HTML that goes into the `<head>` */
	head: string;
	/** @deprecated use `body` instead */
	html: string;
	/** HTML that goes somewhere into the `<body>` */
	body: string;
}

export type RenderOutput = SyncRenderOutput & PromiseLike<SyncRenderOutput>;
