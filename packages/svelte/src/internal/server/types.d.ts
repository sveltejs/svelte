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

export type Csp = { nonce: string } | { hash: boolean };

export type CspInternal = { nonce?: string; hash: boolean };

export interface HydratableLookupEntry {
	value: unknown;
	serialized: string;
	promises?: Array<Promise<void>>;
	/** dev-only */
	stack?: string;
}

export interface HydratableContext {
	lookup: Map<string, HydratableLookupEntry>;
	comparisons: Promise<void>[];
	unresolved_promises: Map<Promise<string>, string>;
}

export interface RenderContext {
	hydratable: HydratableContext;
}

export type Sha256Source = `sha256-${string}`;

export interface SyncRenderOutput {
	/** HTML that goes into the `<head>` */
	head: string;
	/** @deprecated use `body` instead */
	html: string;
	/** HTML that goes somewhere into the `<body>` */
	body: string;
	hashes: {
		script: Sha256Source[];
	};
}

export type RenderOutput = SyncRenderOutput & PromiseLike<SyncRenderOutput>;
