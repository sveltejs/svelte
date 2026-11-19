/** @import { TemplateNode } from '#client' */
/** @import { Renderer } from './types.js' */
import { DOCUMENT_FRAGMENT_NODE } from '#client/constants';
import { get_next_sibling, get_parent_node, insert_before, node_type } from '../dom/operations.js';
import { queue_micro_task } from '../dom/task.js';
import { set_before_effects } from '../reactivity/batch.js';
import { pop_renderer, push_renderer } from './state.js';

/**
 * @typedef {{
 *   host: Renderer | null;
 *   guest: Renderer | null;
 *   host_node: TemplateNode;
 *   start: TemplateNode;
 *   end: TemplateNode;
 * }} Crossing
 */

/**
 * The crossings rendered into each container, in the order of their content in the container
 * @type {Map<unknown, Crossing[]>}
 */
var containers = new Map();

/**
 * The number of containers with more than one crossing. Only those need syncing
 */
var shared_containers = 0;

var queued = false;

/**
 * Registers a crossing whose content (between `start` and `end`) was appended to `container`
 * @param {unknown} container
 * @param {Crossing} crossing
 */
export function add_crossing(container, crossing) {
	var crossings = containers.get(container);

	if (crossings === undefined) {
		containers.set(container, [crossing]);
		return;
	}

	crossings.push(crossing);

	if (crossings.length === 2 && shared_containers++ === 0) {
		// updates can move host nodes (e.g. in a keyed `{#each}` block), so sync each time a
		// batch has updated the content, before its user effects run
		set_before_effects(sync_shared_containers);
	}

	// the host node might not be in its final position yet (e.g. it's still in a template fragment
	// that hasn't been inserted), so sync once the current work is done. Batches sync when they
	// update the content anyway, but initial renders don't involve one
	if (!queued) {
		queued = true;
		queue_micro_task(() => {
			queued = false;
			sync_shared_containers();
		});
	}
}

/**
 * @param {unknown} container
 * @param {Crossing} crossing
 */
export function remove_crossing(container, crossing) {
	var crossings = /** @type {Crossing[]} */ (containers.get(container));
	crossings.splice(crossings.indexOf(crossing), 1);

	if (crossings.length === 1 && --shared_containers === 0) {
		set_before_effects(null);
	}
	if (crossings.length === 0) containers.delete(container);
}

/**
 * Reorders the content of crossings that share a container to match the order of their host nodes,
 * which can change without the crossings being recreated (e.g. in a keyed `{#each}` block)
 */
export function sync_shared_containers() {
	// Moving the content of a crossing also moves the host nodes of the crossings nested inside it,
	// which can be in another shared container (e.g. DOM > renderer A > renderer B) that was already
	// synced. So if anything moved, sync again. This settles, since content only ever contains the
	// host nodes of crossings nested deeper, and is only needed with several shared containers
	do {
		var moved = false;

		for (var crossings of containers.values()) {
			if (crossings.length > 1 && sync(crossings)) moved = true;
		}
	} while (moved && shared_containers > 1);
}

/**
 * @param {Crossing[]} crossings
 * @returns {boolean} whether any content was moved
 */
function sync(crossings) {
	var host = crossings[0].host;

	// with different hosts there's no common order to follow
	for (var crossing of crossings) {
		if (crossing.host !== host) return false;
	}

	var previous_renderer = push_renderer(host);

	try {
		/** @type {Map<Crossing, TemplateNode[]>} */
		var paths = new Map();

		/**
		 * The crossings whose host nodes are in the same tree, by the root of that tree. Host nodes
		 * can be in different trees (e.g. one is offscreen while an async batch is pending, or the
		 * host renderer has several roots), in which case there's no order between them
		 * @type {Map<TemplateNode, Crossing[]>}
		 */
		var trees = new Map();

		for (crossing of crossings) {
			var nodes = path(crossing.host_node);
			var tree = trees.get(nodes[0]);

			if (tree === undefined) trees.set(nodes[0], (tree = []));

			tree.push(crossing);
			paths.set(crossing, nodes);
		}

		for (tree of trees.values()) {
			tree.sort((a, b) =>
				compare(
					/** @type {TemplateNode[]} */ (paths.get(a)),
					/** @type {TemplateNode[]} */ (paths.get(b))
				)
			);
		}

		// order the crossings of each tree, slotting them into the positions that the crossings
		// of that tree occupied. This way, crossings keep their place relative to those of other trees
		var order = crossings.map((crossing) => {
			var root = /** @type {TemplateNode[]} */ (paths.get(crossing))[0];
			return /** @type {Crossing} */ (/** @type {Crossing[]} */ (trees.get(root)).shift());
		});

		if (order.every((crossing, index) => crossing === crossings[index])) return false;
	} finally {
		pop_renderer(previous_renderer);
	}

	previous_renderer = push_renderer(order[0].guest);

	try {
		// working backwards from the last crossing, which stays where it is, move each crossing's
		// content in front of the next one's (unless it's already there)
		for (var k = order.length - 2; k >= 0; k--) {
			var next = order[k + 1].start;
			if (get_next_sibling(order[k].end) === next) continue;

			var node = /** @type {TemplateNode | null} */ (order[k].start);

			while (node !== null) {
				var sibling = node === order[k].end ? null : get_next_sibling(node);
				insert_before(next, node);
				node = sibling;
			}
		}
	} finally {
		pop_renderer(previous_renderer);
	}

	crossings.splice(0, crossings.length, ...order);
	return true;
}

/**
 * The node and its ancestors, starting with the root (uses the current renderer)
 * @param {TemplateNode} node
 */
function path(node) {
	/** @type {TemplateNode[]} */
	var nodes = [];

	for (var n = /** @type {TemplateNode | null} */ (node); n !== null; n = get_parent_node(n)) {
		nodes.push(n);
		if (node_type(n) === DOCUMENT_FRAGMENT_NODE) break;
	}

	return nodes.reverse();
}

/**
 * Compares the positions of two nodes in the same tree, given their paths (uses the current renderer)
 * @param {TemplateNode[]} a
 * @param {TemplateNode[]} b
 */
function compare(a, b) {
	var i = 0;
	while (i < a.length && i < b.length && a[i] === b[i]) i++;

	// one contains the other, which host nodes of different crossings can't do
	if (i === a.length || i === b.length) return 0;

	// a[i] and b[i] are siblings: find out which comes first
	for (var node = get_next_sibling(a[i]); node !== null; node = get_next_sibling(node)) {
		if (node === b[i]) return -1;
	}

	return 1;
}
