import type { Transport } from '#shared';
import type { ObservableCache } from '../shared/observable-cache';
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

export interface RenderContext {
	hydratables: Map<
		string,
		{
			value: Promise<unknown>;
			transport: Transport<any> | undefined;
		}
	>;
	cache: ObservableCache;
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
