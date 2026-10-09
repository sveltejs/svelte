import type { UnevalReplacer } from 'devalue';
import type { MaybePromise, WarpKey } from '#shared';
import type { Element } from './dev';
import type { Renderer } from './renderer';

export interface SSRContext {
	/** parent */
	p: null | SSRContext;
	/** component context */
	c: null | Map<unknown, unknown>;
	/** renderer */
	r: null | Renderer;
	/** True if initialized, i.e. an `await` was reached */
	i: boolean;
	/** dev mode only: the current component function */
	function?: any;
	/** dev mode only: the current element */
	element?: Element;
}

export interface WarpStore {
	/** The values stored in each `Warp`, keyed by the `Warp`'s id */
	values: Map<string, Map<WarpKey, unknown>>;
	/** dev-only: where each value was set, keyed by the `Warp`'s id */
	stacks: Map<string, Map<WarpKey, string>>;
	/** dev-only: `hydratable` clobbering checks, which reject on mismatch */
	comparisons: Promise<void>[];
	/** Whether the values have been serialized into the `head` */
	emitted: boolean;
	/**
	 * When streaming, receives values that are set after the `head` has been generated, so they can be
	 * sent to the client in the `tail`. If `null` once the values have been serialized, no more can be added
	 */
	late: ((id: string, key: WarpKey, value: unknown) => void) | null;
}

export interface RenderContext {
	warp: WarpStore;
	/** Whether a `render` has claimed this context. Each context can only be rendered once */
	rendered: boolean;
	/** The `replacer` passed to `withWarp` */
	replacer: UnevalReplacer | undefined;
	/** Settles when the background work of the render (inside pending boundaries) is done, if there is any */
	background: Promise<void> | null;
}
