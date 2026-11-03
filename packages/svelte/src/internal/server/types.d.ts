import type { UnevalReplacer } from 'devalue';
import type { WarpKey } from '#shared';
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
	/** Whether the values have been serialized into the `head` */
	emitted: boolean;
	/**
	 * When streaming, receives values that are added after the `head` was serialized, so they can be
	 * sent to the client in the `tail`. If `null` once the values have been serialized, no more can be added
	 */
	late: ((id: string, key: WarpKey, value: unknown) => void) | null;
}

export interface RenderContext {
	warp: WarpStore;
	/** Whether a `render` has claimed this context. Each context can only be rendered once */
	rendered: boolean;
	/** The `replacer` passed to `withWarp`, or to `render` if it isn't inside one */
	replacer: UnevalReplacer | undefined;
	/** In WebContainers, resolves once the background work is done, so that the next render can start */
	held: Promise<void> | null;
}
