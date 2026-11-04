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

/** A first-layer pending boundary whose contents are rendered in the background */
export interface PendingBoundary {
	/** Assigned when the HTML is put together, in document order, so that it's stable between renders */
	id: string | null;
}

/**
 * A message for the `tail`: a value that was added to a `Warp`, as `[id, key, value]`, or a
 * boundary whose synchronous work has finished, so its contents can be rendered on the client
 */
export type TailMessage = [id: string, key: WarpKey, value: unknown] | PendingBoundary;

export interface WarpStore {
	/** The values stored in each `Warp`, keyed by the `Warp`'s id */
	values: Map<string, Map<WarpKey, unknown>>;
	/** dev-only: where each value was set, keyed by the `Warp`'s id */
	stacks: Map<string, Map<WarpKey, string>>;
	/** Whether the values have been serialized into the `head` */
	emitted: boolean;
	/**
	 * The keys added to each `Warp` by work inside pending boundaries, which go in the `tail` rather
	 * than the `head` — unless the rest of the render uses them before the `head` is serialized
	 */
	owned: Map<string, Set<WarpKey>>;
	/** Messages for the `tail`, in the order they happened, until the `tail` takes them */
	queue: TailMessage[];
	/**
	 * When streaming, called when a message is added to `queue`, so it can be sent. If `null` once
	 * the values have been serialized, no more can be added
	 */
	late: (() => void) | null;
}

export interface RenderContext {
	warp: WarpStore;
	/** The pending boundary that the current work is inside, if it's running in the background */
	boundary: PendingBoundary | null;
	/** Whether a `render` has claimed this context. Each context can only be rendered once */
	rendered: boolean;
	/** The `replacer` passed to `withWarp`, or to `render` if it isn't inside one */
	replacer: UnevalReplacer | undefined;
	/** In WebContainers, resolves once the background work is done, so that the next render can start */
	held: Promise<void> | null;
}
