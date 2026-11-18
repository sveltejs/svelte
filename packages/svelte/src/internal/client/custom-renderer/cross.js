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
import * as e from '../errors.js';
import { current_renderer, push_renderer } from './state.js';

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
			host === null ? 'the DOM' : render !== null ? 'a different custom renderer' : 'a custom renderer'
		);
	}

	// the host side of the crossing: a single node, inserted using the host renderer
	var host_node = /** @type {TemplateNode} */ (connection.node ?? create_text());
	insert_before(anchor, host_node);
	assign_nodes(host_node, host_node);

	/** @type {TemplateNode} */
	var start;
	/** @type {TemplateNode} */
	var end;

	/** @type {T} */
	var result;

	var pop_renderer = push_renderer(renderer);

	try {
		// the guest side: markers inside the container, inserted using the guest renderer
		start = create_text();
		end = create_text();
		var container = /** @type {Node} */ (connection.container);
		append_child(container, start);
		append_child(container, end);

		branch(() => {
			result = render(end);
		});
	} finally {
		pop_renderer();
	}

	// created after the guest branch, so it runs after the guest's own teardown logic.
	// Removing everything between the markers is idempotent, and is necessary even if
	// the host node is being removed, since the container could be shared between
	// several crossings (e.g. multiple scenes rendered into the same canvas)
	teardown(() => {
		var pop_renderer = push_renderer(renderer);

		try {
			var node = /** @type {TemplateNode | null} */ (start);

			while (node !== null) {
				var next = node === end ? null : get_next_sibling(node);
				remove_node(/** @type {ChildNode} */ (node));
				node = next;
			}
		} finally {
			pop_renderer();
		}

		connection.destroy?.();
	});

	// @ts-expect-error assigned synchronously by the branch
	return result;
}
