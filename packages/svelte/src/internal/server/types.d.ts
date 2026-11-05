import type { UnevalReplacer } from 'devalue';
import type { WarpKey } from '#shared';
import type { Element } from './dev';
import type { PendingBoundary, Renderer } from './renderer';

export type { PendingBoundary };

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

/**
 * Every value added to a `Warp` is sent to the client exactly once, either in the `head` (serialized
 * once the HTML is put together) or in the `tail` (streamed afterwards). Until the `head` is serialized:
 * - every `[id, key, value]` in `queue` was added inside a pending boundary
 * - every key in `tail_keys` has exactly one `[id, key, value]` in `queue` (keys are write-once)
 *
 * When the `head` is serialized (see `split_head_and_tail`), the values whose keys are still in
 * `tail_keys` stay in `queue` for the `tail`, and the rest go in the `head`. After that, every value
 * that's added goes straight into `queue`
 */
export interface WarpStore {
	/** The values stored in each `Warp`, keyed by the `Warp`'s id */
	values: Map<string, Map<WarpKey, unknown>>;
	/** dev-only: where each value was set, keyed by the `Warp`'s id */
	stacks: Map<string, Map<WarpKey, string>>;
	/** Whether the values have been serialized into the `head` */
	emitted: boolean;
	/**
	 * The keys, for each `Warp`'s id, that were added by work inside pending boundaries and haven't been
	 * read outside one. They go in the `tail`. Reading one outside a boundary removes it, so it goes in the
	 * `head` instead, since the rest of the render depends on it. Empty once the `head` is serialized
	 */
	tail_keys: Map<string, Set<WarpKey>>;
	/** Messages for the `tail`, in the order they happened, until the `tail` takes them */
	queue: TailMessage[];
	/**
	 * Whether a `tail` is streaming and can still send values. Once the `head` is serialized, values
	 * can only be added while this is `true`
	 */
	streaming: boolean;
	/** While `streaming`, called when a message is added to `queue`, so it can be sent */
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
