/** @import { TemplateNode } from '#client' */
/** @import { Renderer, RendererConnection } from './types.js' */
import { branch, teardown } from '../reactivity/effects.js';
import { assign_nodes } from '../dom/template.js';
import {
	append_child,
	create_text,
	get_next_sibling,
	get_parent_node,
	insert_before,
	remove_node
} from '../dom/operations.js';
import { listen_to_delegated_events } from '../dom/elements/events.js';
import * as e from '../errors.js';
import { current_renderer, push_renderer, pop_renderer } from './state.js';
import { add_crossing, remove_crossing } from './containers.js';

/**
 * Returns `true` if rendering content that belongs to `renderer` at the current
 * position means crossing from one renderer into another (DOM is `null`)
 * @param {Renderer | null} renderer
 */
export function is_crossing(renderer) {
	return current_renderer !== renderer;
}

/**
 * Renders content belonging to `renderer` inside content belonging to a different renderer.
 *
 * The crossing is represented in the host tree by a single host-owned node, so
 * that the host can move and remove it like any other node without ever walking
 * siblings that belong to another renderer. The guest content is rendered into a
 * container owned by `renderer`, between two guest-owned markers.
 *
 * @template T
 * @param {Renderer | null} renderer The renderer the content belongs to (`null` for DOM)
 * @param {TemplateNode} anchor An anchor owned by the current (host) renderer
 * @param {(anchor: TemplateNode) => T} render
 * @returns {T}
 */
export function cross(renderer, anchor, render) {
	var host = current_renderer;
	var parent = get_parent_node(anchor);

	/** @type {RendererConnection<unknown, unknown>} */
	var connection;

	if (renderer?.embed) {
		connection = renderer.embed({ host, parent, anchor });
	} else if (host?.host) {
		connection = host.host({ guest: renderer, parent, anchor });
	} else {
		e.renderer_cannot_cross(
			renderer === null ? 'the DOM' : 'a custom renderer',
			host === null
				? 'the DOM'
				: render !== null
					? 'a different custom renderer'
					: 'a custom renderer'
		);
	}

	// the host side of the crossing: a single node, inserted using the host renderer
	var host_node = /** @type {TemplateNode} */ (connection.node ?? create_text());
	insert_before(anchor, host_node);
	assign_nodes(host_node, host_node);

	/**
	 * The guest-owned markers, set once they are both in the container
	 * @type {TemplateNode | null}
	 */
	var start = null;
	/** @type {TemplateNode | null} */
	var end = null;

	/**
	 * Stops listening for delegated events on a DOM container
	 * @type {(() => void) | null}
	 */
	var stop_listening = null;

	/** @type {T} */
	var result;

	var previous_renderer = push_renderer(renderer);

	try {
		// the guest side: markers inside the container, inserted using the guest renderer
		var first = create_text();
		var last = create_text();
		var container = /** @type {Node} */ (connection.container);
		append_child(container, first);
		append_child(container, last);
		start = first;
		end = last;

		// several crossings can share a container, in which case their content is kept in the
		// order of their host nodes (see `sync_shared_containers`)
		var crossing = { host, guest: renderer, host_node, start, end };
		add_crossing(container, crossing);

		if (renderer === null) {
			// DOM content compiles event handlers like `onclick` to delegated handlers, which
			// only run if the event reaches a delegation root. The container is usually outside
			// the DOM mount target (or there is no DOM mount at all), so make it a root
			stop_listening = listen_to_delegated_events(container);
		}

		branch(() => {
			result = render(last);
		});
	} finally {
		pop_renderer(previous_renderer);

		// Registered in `finally` so that the connection is cleaned up even if rendering the
		// guest throws (e.g. inside a `<svelte:boundary>`), and created after the guest branch
		// so that it runs after the guest's own teardown logic. Removing everything between
		// the markers is idempotent, and is necessary even if the host node is being removed,
		// since the container could be shared between several crossings (e.g. multiple scenes
		// rendered into the same canvas)
		teardown(() => {
			if (crossing !== undefined) remove_crossing(container, crossing);

			var previous_renderer = push_renderer(renderer);

			try {
				var node = start;

				while (node !== null) {
					var next = node === end ? null : get_next_sibling(node);
					remove_node(/** @type {ChildNode} */ (node));
					node = next;
				}
			} finally {
				pop_renderer(previous_renderer);
			}

			stop_listening?.();
			connection.destroy?.();
		});
	}

	// @ts-expect-error assigned synchronously by the branch
	return result;
}
