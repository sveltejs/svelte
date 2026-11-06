import type { UnevalReplacer } from 'devalue';
import type { WarpKey } from '#shared';
import type { Element } from './dev';
import type { PendingBoundary, Renderer } from './renderer';
import type { WarpStore } from './warp-store';

export type { PendingBoundary, WarpStore };

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

/**
 * A message for the `tail`: a value that was added to a `Warp`, as `[id, key, value]`, or a
 * boundary whose synchronous work has finished, so its contents can be rendered on the client
 */
export type TailMessage = [id: string, key: WarpKey, value: unknown] | PendingBoundary;

export interface RenderContext {
	warp: WarpStore;
	/**
	 * Whether the current work is inside a pending boundary, running in the background. Only set with
	 * `AsyncLocalStorage`: in WebContainers, the work doesn't start until the `head` has been serialized,
	 * after which it doesn't matter (see `Renderer.background`)
	 */
	in_boundary: boolean;
	/** Whether a `render` has claimed this context. Each context can only be rendered once */
	rendered: boolean;
	/** The `replacer` passed to `withWarp`, or to `render` if it isn't inside one */
	replacer: UnevalReplacer | undefined;
	/** In WebContainers, resolves once the background work is done, so that the next render can start */
	held: Promise<void> | null;
}
